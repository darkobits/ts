import path from 'path';

export default {
  afterRepack: ({ fs, packDir }) => {
    // Moves config/tsconfig-base.json to tsconfig.json in the re-packed package
    // root. This allows consumers to extend "@darkobits/ts/tsconfig.json" in
    // their tsconfig files. Note: Users cannot use a simple package identifier
    // like "@darkobits/ts" because Vitest/Vite will try to load 'index.js'.
    fs.moveSync(
      path.resolve(packDir, 'config', 'tsconfig-base.json'),
      path.resolve(packDir, 'tsconfig.json')
    );
  }
};
