import path from 'path';

export default {
  afterRepack: ({ fs, packDir }) => {
    fs.moveSync(
      path.resolve(packDir, 'config', 'tsconfig-base.json'),
      path.resolve(packDir, 'tsconfig.json')
    );
  }
};
