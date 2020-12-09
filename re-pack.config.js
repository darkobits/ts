const path = require('path');

module.exports = {
  afterRepack: ({ fs, packDir }) => {
    fs.moveSync(
      path.resolve(packDir, 'config', 'tsconfig-base.json'),
      path.resolve(packDir, 'tsconfig.json'),
      { overwrite: true }
    );
  }
};
