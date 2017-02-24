const _ = require('lodash')
const serviceProxy = require('../services/service-proxy');

class Utils {
  // 分页转换
  static refsFull(req, res, next) {
    const query = req.query;
    const page = query.page || 1; // 第几页
    const perPage = query.perPage || 20; // 一页多少个
    const sortField = query.sortField;
    const sortDir = query.sortDir || 'DESC';
    const sort = {};
    if (sortField) {
      sort[sortField] = sortDir.toLowerCase();
    }
    query.filters = (query.filters && JSON.parse(query.filters)) || {};
    query.limit = parseInt(perPage, 10);
    query.skip = parseInt((page - 1) * perPage, 10);
    query.sort = sort;
    _.assign(req.query, query);
    next();
  }

  static getUserInfo(module) {
    return function (req, res, next) {
      const id = req.user.sub;
      return serviceProxy.send({ module, cmd: 'user_read', data: { filters: { _id: id } } })
        .then((user) => {
          if (!user.success) {
            return res.error({ code: 29999, msg: user.msg });
          }
          req.userInfo = user.data[0];
          return next();
        });
    };
  }
}

module.exports = Utils;
