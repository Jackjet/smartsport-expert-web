const OSS = require('../base-oss');
const config = require('../aliyun-config.js');

module.exports = OSS(config.oss.smartSportBucket);
