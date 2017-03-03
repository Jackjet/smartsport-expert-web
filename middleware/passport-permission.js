const passport = require('passport-strategy');

const config = require('../configs/permission.json');
const serviceProxy = require('../services/service-proxy');
// const logger = require('xyj-logger').Logger('authenticate-controller.js');

/**
 * 权限验证,验证用户是否有权限操作模块
 */
class AuthenticateStrategy {
  constructor() {
    passport.Strategy.call(this);
  }
  /**
   * 路由权限验证passport strategy
   * @param req express路由req
   * @param options passport验证第二参数
   *  * type {String} 权限类型 read: 读, create: 写, update: 改, 删: delete
   * @returns {*}
   */
  authenticate(req, options) {
    const self = this;
    const user = req.user;
    const url = req.baseUrl || req.url;
    let baseUrl = '';
    if (url[0] === '/') {
      baseUrl = url.substring(1).split('/');
    } else {
      baseUrl = url.split('/');
    }
    // 如果没有用户信息,报错
    if (!user || !user.sub) {
      return self.error(new Error('req not have user'));
    }
    // 如果没有module,报错,一般不会出现这种情况
    if (baseUrl[0] === 'api' && baseUrl[1] === 'auth' && !baseUrl[2]) {
      return self.error(new Error('req url not have module'));
    }

    const module = baseUrl[2];
    // config没数据,默认对应关系名称相同
    if (!config[module]) {
      config[module] = module;
    }
    // 传options执行的代码端
    if (options && options.type) {
      const permissionCode = `${config[module]}_${options.type}`;
      return serviceProxy
        .send({ module: 'expert-user', cmd: 'user_permissionVerify', data: { userId: user.sub, permissionCode } })
        .then((result) => {
          if (result.success) {
            return self.pass();
          }
          return self.fail(403);
        })
        .catch(self.error);
    }
    // 不传options执行的代码端
    const method = req.method.toUpperCase();
    let type = '';
    // 获取请求路由方式 GET: read, POST: create, PUT: update, DELETE: delete
    if (method === 'GET') {
      type = 'read';
    } else if (method === 'POST') {
      type = 'create';
    } else if (method === 'PUT') {
      type = 'update';
    } else if (method === 'DELETE') {
      type = 'delete';
    }
    const permissionCode = `${config[module]}_${type}`;
    return serviceProxy
      .send({ module: 'expert-user', cmd: 'user_permissionVerify', data: { userId: user.sub, permissionCode } })
      .then((result) => {
        if (result.success) {
          return self.pass();
        }
        return self.fail(403);
      })
      .catch(self.error);
  }
}

module.exports = AuthenticateStrategy;