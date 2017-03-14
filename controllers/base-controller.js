const $ = require('../services/service-proxy-2');
const _ = require('lodash');
const Xlog = require('xyj-logger');

class BaseController {
  constructor(name, module, method) {
    this.module = module;
    this.method = method;
    this.logger = Xlog.Logger(name);
  }

  // 创建
  create(req, res, next) {
    if (!req.body) {
      this.logger.error({ url: req.url, body: req.body, err: new Error('缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    const data = req.body;
    // data.createBy = req.user.sub;
    return $[this.module][`${this.method}Create`](data)
      .then((result) => {
        if (!result.success) {
          this.logger.error({ url: req.url, body: req.body, err: new Error(result.msg) });
          return res.error({ code: 29999, msg: result.msg });
        }
        return res.api();
      })
      .catch(next);
  }

  // 修改
  update(req, res, next) {
    if (!req.body || _.isEmpty(req.body) || !req.params.id) {
      this.logger.error({ url: req.url, body: req.body, err: new Error('缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    const data = req.body;
    data.id = req.params.id;
    return $[this.module][`${this.method}Update`](data)
      .then((result) => {
        if (!result.success) {
          this.logger.error({ url: req.url, body: req.body, err: new Error(result.msg) });
          return res.error({ code: 29999, msg: result.msg });
        }
        return res.api();
      })
      .catch(next);
  }

  // 根据id查询
  findById(req, res, next) {
    if (!req.params.id) {
      this.logger.error({ url: req.url, body: req.params, err: new Error('缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    const id = req.params.id;
    return $[this.module][`${this.method}ReadId`]({ id })
      .then((result) => {
        if (!result.success) {
          this.logger.error({ url: req.url, body: req.body, err: new Error(result.msg) });
          return res.error({ code: 29999, msg: result.msg });
        }
        return res.api(result.data);
      })
      .catch(next);
  }

  // 获取列表
  find(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters', 'limit', 'skip', 'sort']);
    return $[this.module][`${this.method}Read`](data)
      .then((result) => {
        if (!result.success) {
          this.logger.error({ url: req.url, body: req.body, err: new Error(result.msg) });
          return res.error({ code: 29999, msg: result.msg });
        }
        return res.api(result.data);
      })
      .catch(next);
  }

  // 删除
  delete(req, res, next) {
    if (!req.params.id) {
      this.logger.error({ url: req.url, body: req.body, err: new Error('缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    const id = req.params.id;
    return $[this.module][`${this.method}Delete`]({ id })
      .then((result) => {
        if (!result.success) {
          this.logger.error({ url: req.url, body: req.body, err: new Error(result.msg) });
          return res.error({ code: 29999, msg: result.msg });
        }
        return res.api(result.data);
      })
      .catch(next);
  }
}

module.exports = BaseController;
