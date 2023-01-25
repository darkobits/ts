import path from 'path';

export default {
  afterRepack: ({ fs, packDir }) => {
    // Moves config/tsconfig-base.json to config/tsconfig.json in the re-packed
    // package root. This allows consumers to extend
    // "@darkobits/ts/config/tsconfig.json" in their tsconfig files.
    // Note: Moving this to the package root to allow extending "@darkobits/ts"
    // no longer works because Vitest will try to load index.js instead of
    // tsconfig.js.
    fs.moveSync(
      path.resolve(packDir, 'config', 'tsconfig-base.json'),
      path.resolve(packDir, 'config', 'tsconfig.json')
    );
  }
};
