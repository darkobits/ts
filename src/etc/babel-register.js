const { EXTENSIONS } = require('./constants');

require('@babel/register')({ extensions: [...EXTENSIONS, '.json'] });
