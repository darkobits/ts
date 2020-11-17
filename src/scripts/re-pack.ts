#!/usr/bin/env node

import path from 'path';

import cli from '@darkobits/saffron';
import chex from '@darkobits/chex';
import fs from 'fs-extra';
import ow from 'ow';
import pacote from 'pacote';
import * as R from 'ramda';
import readPkgUp, { NormalizedPackageJson } from 'read-pkg-up';
import tar from 'tar';
import tempy from 'tempy';

import log from 'lib/log';


/**
 * Fields in package.json that may contain paths that will need to be re-written
 * when packing.
 */
const REWRITE_FIELDS = [
  'bin',
  'directories',
  'main',
  'browser',
  'module',
  'man',
  'files'
];


/**
 * @private
 *
 * Determines the "emptiness" of various data structures.
 */
function isEmpty(value: any) {
  if (ow.isValid(value, ow.array)) {
    // If none of the elements in the array are truthy, consider it "empty".
    return R.none<any>(R.identity, value);
  }

  if (ow.isValid(value, ow.object)) {
    // If none of the object's values are truthy, consider it "empty".
    return R.none<any>(R.identity, R.values(value));
  }

  return R.isEmpty(value);
}


export interface PkgInfo {
  json: NormalizedPackageJson;
  rootDir: string;
}

/**
 * @private
 *
 * Reads the package.json for the host package by walking up the directory tree
 * from the current working directory. An optional `cwd` param may be provided
 * to override the default.
 */
async function getPkgInfo(cwd: string = process.cwd()): Promise<PkgInfo> {
  const pkgInfo = await readPkgUp({ cwd });

  if (!pkgInfo) {
    throw new Error(`log.prefix('getPkgInfo') Unable to locate package root from: ${log.chalk.green(cwd)}`);
  }

  // Compute package root directory.
  const pkgRootDir = path.dirname(pkgInfo.path);
  const pkgJson = pkgInfo.packageJson;

  return {
    json: pkgJson,
    rootDir: pkgRootDir
  };
}


/**
 * @private
 *
 * Creates the temporary publish workspace in the host package's root and
 * ensures it is empty.
 */
async function createPublishWorkspace(pkgRootDir: string, publishDir: string) {
  // Compute path to publish root.
  const publishWorkspacePath = path.resolve(pkgRootDir, publishDir);

  // Ensure publish directory exists and is empty.
  try {
    await fs.ensureDir(publishWorkspacePath);
  } catch (err) {
    throw new Error(`${log.prefix('createPublishWorkspace')} Unable to create publish workspace directory: ${err.message}`);
  }

  try {
    await fs.emptyDir(publishWorkspacePath);
  } catch (err) {
    throw new Error(`${log.prefix('createPublishWorkspace')} Unable to ensure publish workspace is empty: ${err.message}`);
  }

  log.verbose(log.prefix('createPublishWorkspace'), `Created publish workspace at: ${log.chalk.green(publishWorkspacePath)}`);
  return publishWorkspacePath;
}


/**
 * @private
 *
 * Modifies and writes to the publish workspace a new package.json with correct
 * paths based on the files hoisted from `pkgHoistDir`.
 *
 * Note. This function assumes the publish workspace has already been created
 * and can be written to.
 */
async function rewritePackageJson(pkgJson: NormalizedPackageJson, publishRootDir: string, pkgHoistDir: string) {
  const rewriteField = (value: string) => path.relative(pkgHoistDir, value);

  try {
    const newPkgJson = R.reduce((acc, curField) => {
      if (!R.has(curField, acc)) {
        return acc;
      }

      const curValue = pkgJson[curField];
      let newValue: typeof curValue;

      if (ow.isValid(curValue, ow.string)) {
        newValue = rewriteField(curValue);
      } else if (ow.isValid(curValue, ow.array.ofType(ow.string))) {
        newValue = R.map(rewriteField, curValue);
      } else if (ow.isValid(curValue, ow.object.valuesOfType(ow.string))) {
        newValue = R.mapObjIndexed(rewriteField, curValue);
      } else {
        throw new Error(`Encountered unknown field in package.json: ${log.chalk.yellow(curField)}`);
      }

      // If the field winds up being an empty object, empty array, or an empty
      // string, omit it from the re-written package.json.
      if (isEmpty(newValue)) {
        log.verbose(log.prefix('rewritePackageJson'), `Omitting empty/superfluous field: ${log.chalk.yellow(curField)}.`);
        return R.dissoc(curField, acc);
      }

      return R.assoc(curField, newValue, acc);
    }, pkgJson, REWRITE_FIELDS);

    // Write the new package.json to the publish workspace.
    await fs.writeJson(path.resolve(publishRootDir, 'package.json'), newPkgJson, { spaces: 2 });
    log.verbose(log.prefix('rewritePackageJson'), `Wrote ${log.chalk.green('package.json')} to publish workspace.`);
  } catch (err) {
    throw new Error(`${log.prefix('rewritePackageJson')} Error re-writing package.json: ${err.message}`);
  }
}


/**
 * @private
 *
 * Packs and the unpacks the host package's publishable files to the publish
 * workspace using `npm pack`.
 *
 * Note: This function assumes the publish workspace has already been created.
 */
async function packToPublishWorkspace(pkgRoot: string, publishWorkspace: string) {
  // Get a temporary file name for our tarball.
  const tarballPath = tempy.file();

  // Pack the host package.
  await pacote.tarball.file(pkgRoot, tarballPath, { preferOffline: true });

  // Extract tarball contents to publish directory. We use stripComponents=1
  // here because NPM puts all tarball contents under a 'package' directory
  // inside the tarball.
  await tar.extract({
    file: tarballPath,
    cwd: publishWorkspace,
    strip: 1,
    // Skip extracting package.json into the publish workspace because we will
    // write our own.
    filter: (filePath: string) => !filePath.includes('package.json')
  });

  // Remove the tarball.
  await fs.remove(tarballPath);
}


/**
 * @private
 *
 * Moves all files in `publishDir` to the publish workspace.
 *
 * Note. This function assumes that package artifacts have already been unpacked
 * into the publish workspace.
 */
async function hoistBuildDir(publishWorkspace: string, publishDir: string) {
  try {
    const absPublishDir = path.resolve(publishWorkspace, publishDir);
    const publishDirStats = await fs.stat(absPublishDir);

    if (!publishDirStats.isDirectory) {
      throw new Error(`${log.prefix('hoistBuildDir')} "${log.chalk.green(publishDir)}" is not a directory.`);
    }

    // Get a list of all files in the publish workspace that will need to be
    // hoisted.
    const filesInPublishWorkspace = await fs.readdir(path.resolve(publishWorkspace, publishDir));
    log.verbose(log.prefix('hoistBuildDir'), 'Files in build directory to be hoisted:', filesInPublishWorkspace);

    // Move each file/folder up from the output directory to the publish
    // workspace.
    await Promise.all(filesInPublishWorkspace.map(async fileInPublishWorkspace => {
      const from = path.resolve(publishWorkspace, publishDir, fileInPublishWorkspace);
      const to = path.resolve(publishWorkspace, fileInPublishWorkspace);

      try {
        await fs.move(from, to, { overwrite: false });
        log.verbose(log.prefix('hoistBuildDir'), `Moved file ${log.chalk.green(from)} => ${log.chalk.green(to)}.`);
      } catch (err) {
        throw new Error(`Unable to move file ${log.chalk.green(from)} to ${log.chalk.green(to)}: ${err.message}`);
      }
    }));

    // Remove the (hopefully empty) `publishDir` directory now that all files
    // and folders therein have been hoisted.
    log.silly(log.prefix('hoistBuildDir'), `Removing build directory ${log.chalk.green(absPublishDir)}`);
    await fs.rmdir(absPublishDir);
    log.verbose(log.prefix('hoistBuildDir'), `Hoisted files from ${log.chalk.green(absPublishDir)} to publish root.`);
  } catch (err) {
    throw new Error(`${log.prefix('hoistBuildDir')} Error hoisting file/directory: ${err.message}`);
  }
}


/**
 * Provided the path to a publish workspace and a map of symlinks to create,
 * creates each symlink.
 *
 * Note: This function assumes that the "hoisting" phase has already been
 * completed
 */
async function symlinkEntries(publishWorkspace: string, entries: Array<{from: string; to: string}>) {
  try {
    await Promise.all(R.map(async ({ from, to }) => {
      const absolutePathToLinkDestination = path.resolve(publishWorkspace, from);
      await fs.ensureSymlink(to, absolutePathToLinkDestination);
      log.info(log.prefix('entry'), `${log.chalk.green.bold(from)} ${log.chalk.bold('→')} ${log.chalk.green(to)}`);
    }, entries));
  } catch (err) {
    throw new Error(`${log.prefix('symlinkEntries')} Error creating symlink: ${err.message}`);
  }
}


/**
 * @private
 *
 * Performs a dry run of `npm pack` in the provided root directory and prints
 * the output. Used as a debugging feature to let users introspect what will
 * be published from the publish workspace.
 */
async function packDryRun(cwd: string) {
  const npm = await chex('npm >=5');

  await npm(['pack', '--dry-run', '--ignore-scripts'], {
    cwd,
    stdout: 'ignore',
    stderr: 'inherit'
  });
}


// ---- Publish ----------------------------------------------------------------

export interface PublishOptions {
  /**
   * Directory containing the NPM package to run re-pack on.
   *
   * Default: process.cwd()
   */
  cwd?: string;

  /**
   * Sub-directory in the package containing build artifacts to be hoisted to
   * the package root. Usually 'dist'.
   */
  buildDir: string;

  /**
   * (Optional) Temporary directory in a package's root where re-written package
   * contents will be organized. By default, a temporary directory will be used.
   */
  workspaceDir?: string;

  /**
   * (Optional) Mapping of symlink names -> canonical file locations in the
   * publish workspace. This will allow the user to further customize their
   * import paths.
   */
  entries?: Array<{
    from: string;
    to: string;
  }>;
}


/**
 * Accepts a single subdirectory in a package to "hoist" to the root of the
 * publish workspace.
 */
async function main({ cwd, buildDir, workspaceDir: workspaceDirFromOpts, entries }: PublishOptions) {
  try {
    const workspaceDir = workspaceDirFromOpts ?? tempy.directory({ prefix: 're-pack-' });
    const resolvedCwd = path.resolve(cwd ?? process.cwd());
    const resolvedBuildDir = path.resolve(buildDir);

    // Gather information about the host package.
    const pkg = await getPkgInfo(resolvedCwd);
    log.info(`Preparing package: ${log.chalk.green(pkg.json.name)}`);

    // Compute the absolute path to the publish workspace, create the directory,
    // and ensure it is empty.
    const publishWorkspace = await createPublishWorkspace(pkg.rootDir, workspaceDir);

    // Create a new package.json and write it to the publish workspace.
    await rewritePackageJson(pkg.json, publishWorkspace, resolvedBuildDir);

    // Use NPM pack to collect all files to be published into a tarball, then
    // extract that tarball into the publish workspace.
    await packToPublishWorkspace(pkg.rootDir, publishWorkspace);

    await hoistBuildDir(publishWorkspace, buildDir);

    if (entries) {
      await symlinkEntries(publishWorkspace, entries);
    }

    await packDryRun(publishWorkspace);

    return workspaceDir;
  } catch (err) {
    log.error(err.message);
    log.verbose(err.stack.split('\n').slice(1).join('\n'));
    process.exit(1);
  }
}


// ----- CLI -------------------------------------------------------------------

export interface PublishCliOptions {
  publish?: boolean;
}

export interface PublishConfiguration extends PublishCliOptions {
  entries: PublishOptions['entries'];
}


cli.command<PublishCliOptions, PublishConfiguration>({
  command: '* [cwd]',
  config: {
    fileName: 're-pack',
    auto: false
  },
  builder: ({ command }) => {
    command.positional('cwd', {
      description: 'Directory containing the NPM package to run re-pack on.',
      type: 'string',
      default: 'process.cwd()'
    });

    command.option('publish', {
      description: 'Whether to run "npm publish" after re-pack has run.',
      type: 'boolean',
      default: false,
      required: false
    });
  },
  handler: async ({ argv, config }) => {
    const runTime = log.createTimer();

    const publish = config?.publish ?? argv.publish;

    const workspaceDir = await main({
      buildDir: 'dist',
      entries: config?.entries,
      workspaceDir: '.re-pack'
    });

    log.info(`Done. ${log.chalk.dim(`(${runTime})`)}`);

    if (!publish) {
      log.info(`To publish your package, run ${log.chalk.bold(`npm publish ${workspaceDir}`)}`);
    }
  }
});


cli.init();
