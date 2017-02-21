const nconf = require('nconf');

nconf.argv().env();
const NODE_ENV = process.env['NODE_ENV'] || 'development';
nconf.file({ file: `config.${NODE_ENV}.json` });
