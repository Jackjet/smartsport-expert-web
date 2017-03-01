/**
 * 阿里云服务配置
 */
'use strict';

const NODE_ENV = process.env['NODE_ENV'] || 'development';

module.exports = require(`./aliyun-${NODE_ENV}-config`);
