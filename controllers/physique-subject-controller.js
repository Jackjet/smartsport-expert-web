const $ = require('../services/service-proxy-2');
const _ = require('lodash');
const co = require('co');
const BaseController = require('./base-controller');

// 标准教案
class PlanController extends BaseController {
  constructor() {
    super('physique-subject-controller.js', 'bodyTestManagement', 'subject');
  }

  find(req, res, next) {
    const that = this;
    const data = {};
    const d = [];
    return co(function * () {
      const results = yield $[that.module][`${that.method}Read`]();
      if (!results.success) {
        return res.error({ code: 29999, msg: results.msg });
      }
      results.data.map((r) => {
        if (!data[r.name]) {
          data[r.name] = {};
          data[r.name][r.level] = r._id.toString();
        } else {
          data[r.name][r.level] = r._id.toString();
        }
        return null;
      });
      _.forOwn(data, (v, k) => {
        const x = {};
        x.name = k;
        x.levels = [];
        _.forOwn(v, (v1, k1) => {
          x.levels.push({ level: k1, id: v1 });
        });
        d.push(x);
      });
      return res.api(d);
    })
      .catch(next);
  }
}

module.exports = PlanController;
