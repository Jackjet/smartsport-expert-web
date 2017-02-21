require('./nconf');
const nconf = require('nconf');
const Logger = require('xyj-logger');

Logger.config(nconf.get('logger'));
require('./server');
require('./passport');
