const Locator = require('xyj-service-locator');
const Consul = require('xyj-consul');
const nconf = require('nconf');

const consul = new Consul(nconf.get('consul'));

const NODE_ENV = process.env.NODE_ENV || 'development';
const logger = require('xyj-logger').Logger('serviceProxy.js');
let servicesConfig = require(`../configs/service-config.${NODE_ENV}.json`);
let serviceLocator;

// 开启consul，兼容配置文件方式
if (nconf.get('consulReady')) {
  consul.listFormat((err, config) => {
    if (err) throw err;
    servicesConfig = config;
    serviceLocator = new Locator(servicesConfig);
  });
} else {
  serviceLocator = new Locator(servicesConfig);
}

/**
 * 封装seneca的act方法
 * @param obj {Object} 包装其他参数
 *  * [module|service|role] {string} 模型、模块、快,优先使用module和service
 *  * [cmd] {string} 命令
 *  * data {Object|String} 传递数据
 * @param cb {Function} 回调
 */
exports.send = function (obj, cb) {
  logger.info(obj);
  if (!obj.module || !obj.cmd) {
    logger.error({ obj, err: 'obj参数错误' });
    throw new Error('serviceProxy.send:obj参数错误');
  }
  const service = serviceLocator.get(obj.module);
  return service.send(obj, cb);
};
