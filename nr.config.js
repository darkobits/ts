import { nr } from '@darkobits/ts';

export default nr(({ createCommand, createScript }) => {
  createScript('postbuild', {
    group: 'Build',
    description: 'Re-pack the project after building.',
    run: [
      createCommand('re-pack', ['re-pack'])
    ]
  });

  createScript('publish', {
    group: 'Release',
    description: 'Publish the package using re-pack.',
    run: [
      createCommand('re-pack', ['re-pack', ['publish']])
    ]
  });
});
