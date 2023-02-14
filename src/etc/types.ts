import type { NormalizedPackageJson } from 'read-pkg-up';
import type { UserConfig, ConfigEnv } from 'vite';


/**
 * Object returned by `getPackageContext`.
 */
export interface PackageContext {
  /**
   * Inferred project root. Can be overridden by setting the VITE_ROOT
   * environment variable.
   *
   * @default process.cwd()
   */
  root: string;

  /**
   * Sub-directory that contains the project's source files. Read from
   * "compilerOptions.baseUrl" in tsconfig.json.
   */
  srcDir: string;

  /**
   * Sub-directory to which output files should be written. Read from
   * "compilerOptions.outDir" in tsconfig.json.
   */
  outDir: string;

  /**
   * Path to the project's tsconfig.json file.
   */
  tsConfigPath: string;

  /**
   * Parsed tsconfig.json file.
   */
  tsConfig: any;

  /**
   * Parsed and normalized package.json file.
   */
  packageJson: NormalizedPackageJson;
}


/**
 * Context object that will be passed to user configuration functions. Extends
 * the default ConfigEnv provided by Vite with the values from PackageContext
 * above.
 */
export type ConfigurationContext = ConfigEnv & PackageContext;


/**
 * Signature of configuration functions passed to a Vite configuration preset.
 */
export type CustomUserConfigFn = (context: ConfigurationContext) => UserConfig | Promise<UserConfig>;
export type CustomUserConfigExport = UserConfig | Promise<UserConfig> | CustomUserConfigFn;
