/**
 * app版本管理
 * @module app-version
 */

const serviceProxy = require('../services/service-proxy');

const role = 'app-version';
const prifix = 'app_version';

class AppVersionController {

  // 查找列表
  static find(req, res, next) {
    const data = req.query;
    serviceProxy.send({ module: role, cmd: `${prifix}_read`, data })
      .then((result) => {
        if (result.success) {
          res.api(result.data);
        } else {
          res.error({ code: 29999, msg: result.msg || '查找失败' });
        }
      })
      .catch(next);
  }

  // 获取列表总数
  static count(req, res, next) {
    const data = req.query;
    serviceProxy.send({ module: role, cmd: `${prifix}_count`, data })
      .then((result) => {
        if (result.success) {
          res.api(result.data);
        } else {
          res.error({ code: 29999, msg: result.msg || '查找失败' });
        }
      })
      .catch(next);
  }

  // 查找单条记录
  static findById(req, res, next) {
    const data = {
      id: req.params.id,
    };
    serviceProxy.send({ module: role, cmd: `${prifix}_read_id`, data })
      .then((result) => {
        if (result.success) {
          res.api(result.data);
        } else {
          res.error({ code: 29999, msg: result.msg || '查找失败' });
        }
      })
      .catch(next);
  }

}

module.exports = AppVersionController;
