const serviceProxy = require('../services/service-proxy');
const _ = require('lodash');
const Promise = require('bluebird');

class MedicalController {
  /**
   * 创建或编辑体检报告
   * @param req
   * @param res
   * @param next
   * @return {Promise|Promise.<T>}
   */
  static createOrUpdate(req, res, next) {
    const userId = req.user.sub;
    const body = req.body;
    const params = req.params;
    if (!body.student) {
      return res.error({ code: 29999, msg: '缺少必要参数学生id' });
    }
    return Promise.resolve().then(() => {
      const data = body;
      // 创建体检报告
      if (req.method.toUpperCase() === 'POST') {
        data.createBy = userId;
        return serviceProxy.send({ module: 'body-test-management', cmd: 'medical_create', data });
      }
      // 修改体检报告
      data.id = params.id;
      return serviceProxy.send({ module: 'body-test-management', cmd: 'medical_update', data });
    }).then((result) => {
      if (!result.success) {
        return res.error({ code: 29999, msg: result.msg });
      }
      return res.api(result.data);
    }).catch(next);
  }

  /**
   *  条件查询体检报告条数
   * @param req
   * @param res
   * @param next
   * @returns {Promise|Promise.<T>}
   */
  static count(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters']);
    return serviceProxy.send({ module: 'body-test-management', cmd: 'medical_count', data }).then((result) => {
      if (!result.success) {
        return res.error({ code: 29999, msg: result.msg });
      }
      return res.api(result.data);
    }).catch(next);
  }

  /**
   * 查询体检报告列表
   * @param req
   * @param res
   * @param next
   * @returns {Promise|Promise.<T>}
   */
  static get(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters', 'limit', 'skip', 'sort']);
    return serviceProxy.send({ module: 'body-test-management', cmd: 'medical_read', data }).then((result) => {
      if (!result.success) {
        return res.error({ code: 29999, msg: result.msg });
      }
      return res.api(result.data);
    }).catch(next);
  }

  /**
   * 根据id查询体检报告详情
   * @param req
   * @param res
   * @param next
   * @return {Promise.<T>|Promise}
   */
  static getById(req, res, next) {
    const params = req.params;
    const id = params.id;
    return serviceProxy
      .send({ module: 'body-test-management', cmd: 'medical_read_id', data: { id } })
      .then((result) => {
        if (!result.success) {
          return res.error({ code: 29999, msg: result.msg });
        }
        return res.api(result.data);
      }).catch(next);
  }
}

module.exports = MedicalController;
