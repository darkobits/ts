const { EXTENSIONS_WITH_DOT } = require('./constants');

require('@babel/register')({ extensions: [...EXTENSIONS_WITH_DOT, '.json'] });
