const serviceProxy = require('../services/service-proxy');
const logger = require('xyj-logger').Logger('school-class-controller.js');
const _ = require('lodash');

class SchoolClass {
  /**
   * 条件查询班级, 不传则查列表
   * @param req.query
   *  * school {String} 学校id
   * @param done {callback}
   */
  static find(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters', 'limit', 'skip', 'sort']);
    // 根据学校过滤班级
    if (req.userInfo) {
      data.filters.school = req.userInfo.school;
    }
    return serviceProxy
      .send({ module: 'school-class', cmd: 'class_read', data })
      .then((classData) => {
        if (!classData.success) {
          logger.error({ url: req.url, body: req.body, err: new Error(classData.msg) });
          return res.error({ code: 29999, msg: classData.msg });
        }
        return res.api(classData.data);
      })
      .catch(next);
  }
  /**
   * 查询班级数
   * @param req.query
   *  * school {String} 学校id
   * @param done {callback}
   */
  static count(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters']);
    // 根据学校过滤班级
    if (req.userInfo) {
      data.filters.school = req.userInfo.school;
    }
    return serviceProxy.send({ module: 'school-class', cmd: 'class_count', data }).then((result) => {
      if (!result.success) {
        return res.error({ code: 29999, msg: result.msg });
      }
      return res.api(result.data);
    }).catch(next);
  }
  /**
   * 根据id查询班级
   * @param req.params
   *  *id {String} 班级id
   * @param done {callback}
   */
  static findById(req, res, next) {
    if (!req.params.id) {
      logger.error({ url: req.url, body: req.body, err: new Error('缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    return serviceProxy
      .send({ module: 'school-class', cmd: 'class_read_id', data: { id: req.params.id } })
      .then((classData) => {
        if (!classData.success) {
          logger.error({ url: req.url, body: req.body, err: new Error(classData.msg) });
          return res.error({ code: 29999, msg: classData.msg });
        }
        return res.api(classData.data);
      })
      .catch(next);
  }
}

module.exports = SchoolClass;
