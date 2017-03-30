const Locator = require('xyj-service-locator');

const NODE_ENV = process.env.NODE_ENV || 'development';
const servicesConfig = require(`../configs/service-config.${NODE_ENV}.json`);

const serviceLocator = new Locator(servicesConfig);
const logger = require('xyj-logger').Logger('serviceProxy.js');

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
