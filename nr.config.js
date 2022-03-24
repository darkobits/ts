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
});
