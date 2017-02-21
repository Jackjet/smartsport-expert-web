const Promise = require('bluebird');
const ObjectId = require('mongoose').Types.ObjectId;
const _ = require('lodash');
const nconf = require('nconf');
const jwt = require('jsonwebtoken');


const serviceProxy = require('../services/service-proxy');
const logger = require('xyj-logger').Logger('expert-user-controller.js');

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
    data.createdBy = req.user.sub;
    if (!ObjectId.isValid(req.body.role)) {
      return res.error({ code: 29999, msg: '该角色不存在' });
    }
    // 查找专家角色
    return serviceProxy.send({ module: 'expert-user', cmd: 'role_read', data: { _id: req.body.role } })
      .then((r) => {
      // 判断角色存在性
        if (!r.success || !r.data) {
          return res.error({ code: 29999, msg: '该角色不存在' });
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
    _.assign(data, { id: req.params.id });
    return serviceProxy.send({ module: 'expert-user', cmd: 'user_update', data })
      .then((result) => {
        if (!result.success) {
          return res.error({ code: 29999, msg: result.msg || '修改失败' });
        }
        return res.api();
      })
      .catch(next);
  }
  // 获取用户数量
  static count(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters']);
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
    if (!req.body.password || !req.body.oldPassword) {
      logger.error({ url: req.url, body: req.body, err: new Error('修改密码:缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    if (req.body.password === req.body.oldPassword) {
      logger.error({ url: req.url, body: req.body, err: new Error('修改密码:新旧密码不能相同') });
      return res.error({ code: 29999, msg: '新旧密码不能相同' });
    }
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
}

module.exports = UserController;
