import path from 'path';

export default {
  afterRepack: ({ fs, packDir }) => {
    // Moves dist/config/tsconfig-base.json to tsconfig.json in the re-packed
    // package root. This allows consumers to "extend": "@darkobits/ts" in their
    // tsconfig.json files.
    fs.copySync(
      path.resolve(packDir, 'config', 'tsconfig-base.json'),
      path.resolve(packDir, 'tsconfig.json')
    );
  }
};
