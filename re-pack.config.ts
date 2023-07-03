import path from 'path';

import type { RePackConfiguration } from '@darkobits/re-pack';


export default {
  afterRepack: ({ fs, packDir }) => fs.move(
    path.resolve(packDir, 'config', 'tsconfig-base.json'),
    path.resolve(packDir, 'tsconfig.json')
  )
} satisfies RePackConfiguration;
