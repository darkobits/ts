require('./src/etc/babel-register');

// eslint-disable-next-line no-unused-vars
module.exports = require('./src').nr(({ createCommand, createScript }) => {
  createScript({
    name: 'publish',
    group: 'Release',
    description: 'Publish the package using re-pack.',
    commands: [
      createCommand({
        command: 're-pack',
        arguments: { _: ['publish'] }
      })
    ]
  });
});
