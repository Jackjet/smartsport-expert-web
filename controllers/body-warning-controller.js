const $ = require('../services/service-proxy-2');
const _ = require('lodash');
const co = require('co');
const BaseController = require('./base-controller');
const Promise = require('bluebird');

// 标准教案
class PlanController extends BaseController {
  constructor() {
    super('body-warning-controller.js', 'bodyTestManagement', 'warning');
  }

  find(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters', 'limit', 'skip', 'sort']);
    const that = this;
    const physiqueSubject = [];
    let competitiveAbilities = [];
    return co(function * () {
      const warnings = yield $[that.module][`${that.method}Read`](data);
      if (!warnings.success) {
        return res.error({ code: 29999, msg: warnings.msg });
      }
      const w = warnings.data;
      warnings.data.map((warning) => {
        physiqueSubject.push(warning.physiqueSubject);
        competitiveAbilities = _.concat(competitiveAbilities, warning.availableCompetitiveAbilities, warning.tabooCompetitiveAbilities);
        return null;
      });
      const info = yield Promise.props({
        physiqueSubject: $.sportCategory.sportCategoryFind({ filters: { _id: { $in: physiqueSubject } }, limit: 9999 }),
        competitiveAbilities: $.sportCategory.competitiveAbilityRead({ filters: { _id: { $in: competitiveAbilities } }, limit: 9999 }),
      });
      if (!info.physiqueSubject.success || !info.competitiveAbilities.success) {
        return res.error({ code: 29999, msg: info.physiqueSubject.msg + info.competitiveAbilities.msg });
      }
      warnings.data.map((warning, i) => {
        w[i].physiqueSubject = _.find(info.physiqueSubject.data, { _id: warning.physiqueSubject });
        warning.availableCompetitiveAbilities.map((a, j) => {
          w[i].availableCompetitiveAbilities[j] = _.find(info.competitiveAbilities.data, { _id: a });
          return null;
        });
        warning.tabooCompetitiveAbilities.map((a, j) => {
          w[i].tabooCompetitiveAbilities[j] = _.find(info.competitiveAbilities.data, { _id: a });
          return null;
        });
        return null;
      });
      return res.api(w);
    })
      .catch(next);
  }

  findById(req, res, next) {
    const id = req.params.id;
    const that = this;
    return co(function * () {
      const warning = yield $[that.module][`${that.method}ReadId`]({ id });
      if (!warning.success) {
        return res.error({ code: 29999, msg: warning.msg });
      }
      const info = yield Promise.props({
        physiqueSubject: $.sportCategory.sportCategoryReadId({ id: warning.data.physiqueSubject }),
        availableCompetitiveAbilities: $.sportCategory.competitiveAbilityRead({ filters: { _id: { $in: warning.data.availableCompetitiveAbilities } }, limit: 9999 }),
        tabooCompetitiveAbilities: $.sportCategory.competitiveAbilityRead({ filters: { _id: { $in: warning.data.tabooCompetitiveAbilities } }, limit: 9999 }),
      });
      console.log(info)
      if (!info.physiqueSubject.success || !info.availableCompetitiveAbilities.success || !info.tabooCompetitiveAbilities.success) {
        return res.error({ code: 29999, msg: info.physiqueSubject.msg + info.availableCompetitiveAbilities.msg + info.tabooCompetitiveAbilities.msg });
      }
      const data = warning.data;
      data.physiqueSubject = info.physiqueSubject.data;
      data.availableCompetitiveAbilities = info.availableCompetitiveAbilities.data;
      data.tabooCompetitiveAbilities = info.tabooCompetitiveAbilities.data;
      return res.api(data);
    })
      .catch(next);
  }
}

module.exports = PlanController;
