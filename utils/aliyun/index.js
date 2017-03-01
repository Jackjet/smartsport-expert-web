const smartSport = require('./oss-instance/smart-sport');
const configure = require('./aliyun-config');

exports.OSS = {
  smartSport: smartSport,
};

exports.config = configure;