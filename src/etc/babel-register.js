// We cannot use custom module resolution here because this file configures the
// tool that provides it.
const { EXTENSIONS_WITH_DOT } = require('../etc/constants');

require('@babel/register')({
  extensions: [...EXTENSIONS_WITH_DOT, '.json']
});
