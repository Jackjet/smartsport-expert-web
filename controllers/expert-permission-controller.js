const serviceProxy = require('../services/service-proxy');
const _ = require('lodash');

// 通过id用户的权限列表
function getUserPermissions(id) {
  return serviceProxy.send({ module: 'expert-user', cmd: 'permission_read' }).then((result) => {
    if (!result.success) {
      return Promise.reject(new Error(result.msg));
    }
    return serviceProxy.send({ module: 'expert-user', cmd: 'user_read', data: { filters: { _id: id } } })
      .then((user) => {
        if (!user.success) {
          return Promise.reject(new Error(user.msg));
        }
        // 查询id角色信息
        return serviceProxy.send({ module: 'expert-user', cmd: 'role_read_id', data: { id: user.data[0].role } });
      }).then((role) => {
        if (!role.success) {
          return Promise.reject(new Error(role.msg));
        }
        // 将觉得权限匹配到所有权限列表,不存在的删去
        const data = result.data;
        for (let i = 0; i < result.data.length; i += 1) {
          for (let j = 0; j < result.data[i].permissions.length; j += 1) {
            const bol = _.find(role.data.permissions, { code: result.data[i].permissions[j].code });
            if (bol === undefined) {
              data[i].permissions.splice(j, 1);
            }
          }
        }
        return Promise.resolve(data);
      });
  });
}

class ExpertPermissionCtrl {
  // 获取特定角色权限列表
  static getRolePermission(req, res, next) {
    const params = req.params;
    if (!params.id) {
      return res.error({ code: 29999, msg: '参数错误' });
    }
    // 获取所有权限列表
    return getUserPermissions(req.user.sub).then((result) => {
      // 查询角色信息
      return serviceProxy.send({ module: 'expert-user', cmd: 'role_read_id', data: { id: req.params.id.toString() } })
        .then((role) => {
          if (!role.success) {
            return res.error({ code: 29999, msg: role.msg });
          }
          // 将觉得权限匹配到所有权限列表,并标记
          const data = result;
          for (let i = 0; i < data.length; i += 1) {
            for (let j = 0; j < data[i].permissions.length; j += 1) {
              data[i].permissions[j].own = true;
              const bol = _.find(role.data.permissions, { code: data[i].permissions[j].code });
              if (bol === undefined) {
                data[i].permissions[j].own = false;
              }
            }
          }
          return res.api(data);
        });
    }).catch(next);
  }

// 获取当前账号专家角色所有权限
  static getAll(req, res, next) {
    return getUserPermissions(req.user.sub)
      .then(result => res.api(result))
      .catch(next);
  }
}

module.exports = ExpertPermissionCtrl;
