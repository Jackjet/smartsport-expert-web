const Promise = require('bluebird');
const ObjectId = require('mongoose').Types.ObjectId;
const _ = require('lodash');
const nconf = require('nconf');
const jwt = require('jsonwebtoken');


const serviceProxy = require('../services/service-proxy');
const logger = require('xyj-logger').Logger('expert-user-controller.js');

const decodeToken = Promise.promisify(jwt.verify, jwt);

// 重置密码的临时token检验代码
function verifyToken(token) {
  // token 解析
  return decodeToken(token, nconf.get('secret'))
    .then((payload) => {
      const jti = payload.jti;
      // 合法性校验
      if (!jti) {
        return Promise.reject(new Error('invalid token'));
      }
      // 有效性校验
      return serviceProxy.send({ module: 'auth', cmd: 'revokeToken_read', data: { id: jti } })
        .then((t) => {
          if (!t || !t.active) {
            return Promise.reject(new Error('token expired or had been verified'));
          }
          return Promise.resolve(payload);
        });
    });
}

// 用户管理Controller
class UserController {
  // 创建专家账号
  static create(req, res, next) {
    const body = req.body;
    if (!body.accountId || !body.name || !body.role || !body.password || body.status === undefined) {
      logger.error({ url: req.url, body: req.body, err: new Error('用户注册缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    const data = req.body;
    // 添加创建者
    data.createdBy = req.user && req.user.sub;
    data.expertTeam = req.userInfo.expertTeam;
    data.createType = 2;
    if (!ObjectId.isValid(req.body.role)) {
      return res.error({ code: 29999, msg: '该角色不存在' });
    }
    return Promise.props({
      target: serviceProxy.send({ module: 'expert-user', cmd: 'role_read_id', data: { id: data.role } }),
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
        const difference = _.differenceWith(roles.target.data.permissions,
          roles.self.data.permissions, _.isEqual);
        if (difference.length) {
          return res.error({ code: 29999, msg: '超越当前用户权限范围' });
        }
        // 创建
        return serviceProxy.send({ module: 'expert-user', cmd: 'user_create', data })
          .then((result) => {
            if (!result.success) {
              return res.error({ code: 29999, msg: result.msg || '注册失败' });
            }
            return res.api();
          });
      })
      .catch(next);
  }

  // 更新
  static update(req, res, next) {
    if (!req.body || _.isEmpty(req.body) || !req.params.id) {
      logger.error({ url: req.url, body: req.body, err: new Error('修改用户信息:没有要修改的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    // 不能操作当前账号校验
    if (req.params.id === req.user.sub) {
      logger.error({ url: req.url, body: req.body, err: new Error('修改用户信息:不能修改自己账号的信息') });
      return res.error({ code: 29999, msg: '非法操作' });
    }
    // 更新账号信息
    const data = req.body;
    _.assign(data, { id: req.params.id, expertTeam: req.userInfo.expertTeam });
    return serviceProxy.send({ module: 'expert-user', cmd: 'user_read_id', data: { id: req.params.id } })
    .then((user) => {
      if (!user.success || !user.data) {
        return res.error({ code: 29999, msg: '该用户不存在' });
      }
      return Promise.props({
        target: serviceProxy.send({ module: 'expert-user', cmd: 'role_read_id', data: { id: user.data.role } }),
        self: serviceProxy.send({ module: 'expert-user', cmd: 'role_read_id', data: { id: req.userInfo.role } }),
      }).then((roles) => {
        if (!roles.target.success || !roles.self.success || !roles.target.data || !roles.self.data) {
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
        if (data.role) {
          return serviceProxy.send({ module: 'expert-user', cmd: 'role_read_id', data: { id: data.role } })
            .then((role) => {
              if (!role.success || !role.data) {
                return res.error({ code: 29999, msg: '获取权限列表错误x' });
              }
              if (req.userInfo.expertTeam !== role.data.expertTeam) {
                return res.error({ code: 29999, msg: '非本组织角色,无权限修改x' });
              }
              difference = _.differenceWith(role.data.permissions,
                roles.self.data.permissions, _.isEqual);
              if (difference.length) {
                return res.error({ code: 29999, msg: '超越当前用户权限范围x' });
              }
              return serviceProxy.send({ module: 'expert-user', cmd: 'user_update', data })
                .then((result) => {
                  if (!result.success) {
                    return res.error({ code: 29999, msg: result.msg || '修改失败' });
                  }
                  return res.api();
                });
            });
        }
        return serviceProxy.send({ module: 'expert-user', cmd: 'user_update', data })
          .then((result) => {
            if (!result.success) {
              return res.error({ code: 29999, msg: result.msg || '修改失败' });
            }
            return res.api();
          });
      });
    })
      .catch(next);
  }

  // 获取用户数量
  static count(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters']);
    data.filters.expertTeam = req.userInfo.expertTeam;
    data.filters.createType = 2;
    return serviceProxy.send({ module: 'expert-user', cmd: 'user_count', data }).then((result) => {
      if (!result.success) {
        return res.error({ code: 29999, msg: result.msg });
      }
      return res.api(result.data);
    }).catch(next);
  }

  // 获取用户列表
  static find(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters', 'limit', 'skip', 'sort']);
    data.filters.expertTeam = req.userInfo.expertTeam;
    data.filters.createType = 2;
    const team = [];
    const role = [];
    // 查找用户列表
    return serviceProxy.send({ module: 'expert-user', cmd: 'user_read', data }).then((results) => {
      if (!results.success) {
        return res.error({ code: 29999, msg: results.msg });
      }
      const users = results.data;
      users.map((result) => {
        team.push(result.expertTeam);
        role.push(result.role);
        return null;
      });
      // 查找关联专家团队信息和角色信息
      return Promise.props({
        team: serviceProxy.send({
          module: 'expert-team',
          cmd: 'expertTeam_read',
          data: { filters: { _id: { $in: team } } },
        }),
        role: serviceProxy.send({ module: 'expert-user', cmd: 'role_read', data: { filters: { _id: { $in: role } } } }),
      }).then((r) => {
        if (!r.team.success || !r.role.success) {
          return res.error({ code: 29999, msg: !r.team.success ? r.team.msg : r.role.msg });
        }
        users.map((user, index) => {
          // 重组信息,添加团队和角色详情
          users[index].role = _.find(r.role.data, { _id: user.role });
          users[index].expertTeam = _.find(r.team.data, { _id: user.expertTeam });
          return null;
        });
        return res.api(users);
      });
    }).catch(next);
  }

  // 用户登录
  static login(req, res, next) {
    const body = req.body;
    let account = {};
    // 获取帐号id
    return Promise.resolve()
      .then(() => serviceProxy.send({ module: 'expert-user', cmd: 'user_login', data: body }))
      .then((user) => {
        if (!user.success) {
          return res.error({ code: 29999, msg: user.msg });
        }
        account = user.data;
        // 生成token
        return serviceProxy
          .send({ module: 'auth', cmd: 'revokeToken_create', data: { uid: account._id } })
          .then((token) => {
            const extras = {
              realm: body.realm || 'expert-user',
            };
            const secret = nconf.get('secret');
            const expiresIn = nconf.get('tokenExpiresIn');
            const subject = account._id;
            return jwt.sign(extras, secret, {
              subject,
              expiresIn,
              jwtid: token._id.toString(),
            }, (e, revokeToken) => {
              if (e) {
                next(e);
              } else {
                res.api({ token: revokeToken, user: account });
              }
            });
          });
      })
      .catch(next);
  }

  // 修改密码
  static updatePwd(req, res, next) {
    // 参数校验
    if (!req.body.password || !req.body.oldPassword) {
      logger.error({ url: req.url, body: req.body, err: new Error('修改密码:缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    if (req.body.password === req.body.oldPassword) {
      logger.error({ url: req.url, body: req.body, err: new Error('修改密码:新旧密码不能相同') });
      return res.error({ code: 29999, msg: '新旧密码不能相同' });
    }
    // 修改密码
    const data = {};
    data.id = req.user.sub;
    data.password = req.body.password;
    data.oldPassword = req.body.oldPassword;
    return serviceProxy.send({ module: 'expert-user', cmd: 'user_changePwd', data })
      .then((result) => {
        if (!result.success) {
          return res.error({ code: 29999, msg: result.msg || '修改失败' });
        }
        // 修改成功 注销token
        return serviceProxy
          .send({ module: 'auth', cmd: 'revokeToken_logout', data: { id: data.id } })
          .then(() => {
            res.api();
          });
      })
      .catch(next);
  }

  // 获取验证码
  static getVerifyCode(req, res, next) {
    if (!req.body.tel) {
      logger.error({ url: req.url, body: req.body, err: new Error('获取验证码:缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    // 通过手机获取用户信息
    return serviceProxy.send({
      module: 'expert-user',
      cmd: 'user_read',
      data: { filters: { tel: req.body.tel } },
    }).then((results) => {
      if (!results.success) {
        return res.error({ code: 29999, msg: '服务异常' });
      }
      // 未注册手机返回失败
      if (!results.data.length) {
        return res.error({ code: 29999, msg: '该手机号码尚未注册' });
      }
      const data = req.body;
      data.usage = data.usage || 'default';
      data.system = nconf.get('verify-code:role');
      data.len = nconf.get('verify-code:len');
      // 获取验证码
      return serviceProxy
        .send({ module: 'sms', cmd: 'sms_get', data })
        .then((result) => {
          if (!result.success) {
            return res.error({ code: 29999, msg: result.msg });
          }
          return res.api();
        });
    })
      .catch(next);
  }

  // 校验验证码
  static verifyCode(req, res, next) {
    // 参数校验
    if (!req.body.tel || !req.body.code) {
      logger.error({ url: req.url, body: req.body, err: new Error('校验验证码:缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    const data = req.body;
    data.usage = data.usage || 'default';
    data.system = nconf.get('verify-code:role');
    // 验证验证码正确性
    return serviceProxy
      .send({ module: 'sms', cmd: 'sms_verify', data })
      .then((verify) => {
        if (!verify.success) {
          return res.error({ code: 29999, msg: verify.msg });
        }
        // 获取用户信息
        return serviceProxy.send({
          module: 'expert-user',
          cmd: 'user_read',
          data: { filters: { tel: req.body.tel } },
        }).then((user) => {
          if (!user.success) {
            return res.error({ code: 29999, msg: user.msg });
          }
          const account = user.data[0];
          // 生成临时token
          return serviceProxy
            .send({ module: 'auth', cmd: 'revokeToken_create', data: { uid: account._id } })
            .then((token) => {
              const extras = {
                realm: nconf.get('verify-code:role'),
              };
              const secret = nconf.get('secret');
              const expiresIn = nconf.get('verify-code:tokenExpiresIn');
              const subject = account._id;
              return jwt.sign(extras, secret, {
                subject,
                expiresIn,
                jwtid: token._id.toString(),
              }, (e, revokeToken) => {
                if (e) {
                  next(e);
                } else {
                  res.api({ token: revokeToken });
                }
              });
            });
        });
      })
      .catch(next);
  }

  // 重置密码
  static setPwd(req, res, next) {
    if (!req.body.token || !req.body.password) {
      logger.error({ url: req.url, body: req.body, err: new Error('重置密码:缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    // token 校验
    const token = req.body.token;
    return verifyToken(token)
      .then((payload) => {
        const data = {};
        data.id = payload.sub;
        data.password = req.body.password;

        return serviceProxy.send({ module: 'expert-user', cmd: 'user_update', data })
          .then((result) => {
            if (!result.success) {
              return res.error({ code: 29999, msg: result.msg || '重置密码失败' });
            }
            // 修改成功 注销token
            return serviceProxy
              .send({ module: 'auth', cmd: 'revokeToken_logout', data: { id: data.id } })
              .then(() => {
                res.api();
              });
          });
      })
      .catch(next);
  }
}

module.exports = UserController;
