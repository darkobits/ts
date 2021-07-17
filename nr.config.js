require('./src/etc/babel-register');

// eslint-disable-next-line no-unused-vars
module.exports = require('./src').nr(({ createCommand, createScript }) => {
  createScript('publish', {
    group: 'Release',
    description: 'Publish the package using re-pack.',
    run: [
      createCommand('re-pack', ['re-pack', ['publish']])
    ]
  });
});
