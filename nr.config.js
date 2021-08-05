import { nr } from './src';

export default nr(({ createCommand, createScript }) => {
  createScript('docs', {
    description: 'Start a local Docsify server that serves our documentation.',
    run: [
      createCommand('docsify', [
        'docsify', ['serve', 'docs']
      ])
    ]
  });

  createScript('publish', {
    group: 'Release',
    description: 'Publish the package using re-pack.',
    run: [
      createCommand('re-pack', ['re-pack', ['publish']])
    ]
  });

  createScript('postbuild', {
    group: 'Build',
    description: 'Re-pack the project after building.',
    run: [
      createCommand('re-pack', ['re-pack'])
    ]
  });
});
