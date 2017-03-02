const serviceProxy = require('../services/service-proxy');
const logger = require('xyj-logger').Logger('expert-role-controller.js');
const _ = require('lodash');
const Promise = require('bluebird');

// 角色管理
class RoleController {
  // 创建角色
  static create(req, res, next) {
    if (!req.body || !req.body.name) {
      logger.error({ url: req.url, body: req.body, err: new Error('缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    const data = req.body;
    data.createBy = req.user.sub;
    data.expertTeam = req.userInfo.expertTeam;
    data.permissions = req.body.permissions || [];
    // 获取所有权限
    return serviceProxy
      .send({ module: 'expert-user', cmd: 'role_read_id', data: { id: req.userInfo.role } })
      .then((roles) => {
      // 检验所选权限是否在所有权限列表中
        let difference = req.body.permissions;
        difference = _.differenceWith(difference, roles.data.permissions, _.isEqual);
        // 带有所有权限以外的权限信息
        if (difference.length) {
          logger.error({ url: req.url, body: req.body, err: new Error('包含非法权限') });
          return res.error({ code: 29999, msg: '包含非法权限' });
        }
        // 创建角色
        return serviceProxy
          .send({ module: 'expert-user', cmd: 'role_create', data })
          .then(() => res.api());
      })
      .catch(next);
  }
  // 修改角色
  static update(req, res, next) {
    if (!req.body || _.isEmpty(req.body) || !req.params.id) {
      logger.error({ url: req.url, body: req.body, err: new Error('缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    const data = req.body;
    data.id = req.params.id;
    data.permissions = data.permissions || [];
    delete data.expertTeam;
    // 获取所有权限
    return Promise.props({
      target: serviceProxy.send({ module: 'expert-user', cmd: 'role_read_id', data: { id: data.id } }),
      self: serviceProxy.send({ module: 'expert-user', cmd: 'role_read_id', data: { id: req.userInfo.role } }),
    })
      .then((roles) => {
        if (!roles.target.success || !roles.self.success ||
          !roles.target.data || !roles.self.data) {
          return res.error({ code: 29999, msg: '获取权限列表错误' });
        }
        if (req.userInfo.expertTeam !== roles.target.data.expertTeam) {
          return res.error({ code: 29999, msg: '非本组织角色,无权限修改' });
        }
        let difference = _.differenceWith(roles.target.data.permissions,
          roles.self.data.permissions, _.isEqual);
        if (difference.length) {
          return res.error({ code: 29999, msg: '超越当前用户权限范围' });
        }
        difference = _.differenceWith(data.permissions, roles.self.data.permissions, _.isEqual);
        if (difference.length) {
          logger.error({ url: req.url, body: req.body, err: new Error('包含非法权限') });
          return res.error({ code: 29999, msg: '包含非法权限' });
        }
        return serviceProxy
          .send({ module: 'expert-user', cmd: 'role_update', data })
          .then(() => res.api());
      })
      .catch(next);
  }
  // 根据id查询角色
  static findById(req, res, next) {
    if (!req.params.id) {
      logger.error({ url: req.url, body: req.params, err: new Error('查询角色缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    return serviceProxy.send({ module: 'expert-user', cmd: 'role_read_id', data: { id: req.params.id } })
      .then((role) => {
        if (!role.success) {
          logger.error({ url: req.url, body: req.body, err: new Error(role.msg) });
          return res.error({ code: 29999, msg: role.msg });
        }
        if (role.data.expertTeam !== req.userInfo.expertTeam) {
          return res.error({ code: 29999, msg: '非本组织角色,无权限查询' })
        }
        return res.api(role.data);
      })
      .catch(next);
  }

  // 查询角色列表
  static find(req, res, next) {
    return serviceProxy.send({ module: 'expert-user', cmd: 'role_read', data: { filters: { expertTeam: req.userInfo.expertTeam } } })
      .then((role) => {
        if (!role.success) {
          logger.error({ url: req.url, body: req.body, err: new Error(role.msg) });
          return res.error({ code: 29999, msg: role.msg });
        }
        return res.api(role.data);
      })
      .catch(next);
  }
  // 删除角色
  static delete(req, res, next) {
    if (!req.params.id) {
      logger.error({ url: req.url, body: req.body, err: new Error('删除角色缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    return serviceProxy
      .send({ module: 'expert-user', cmd: 'role_delete', data: { id: req.params.id } })
      .then((role) => {
        if (!role.success) {
          logger.error({ url: req.url, body: req.body, err: new Error(role.msg) });
          return res.error({ code: 29999, msg: role.msg });
        }
        return res.api();
      })
      .catch(next);
  }
}

module.exports = RoleController;
