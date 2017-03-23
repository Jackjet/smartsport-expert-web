const serviceProxy = require('../services/service-proxy');
const co = require('co');
const _ = require('lodash');

class GradeDictController {
  // 查询年级
  static find(req, res, next) {
    co(function * run() {
      const query = req.query;
      const data = _.pick(query, ['filters']);
      let id = '';
      if (req.userInfo) {
        console.log(req.userInfo)
        id = req.userInfo.school;
      }
      if (data.filters.school) {
        id = data.filters.school;
        delete data.filters.school;
      }
      if (id !== '') {
        const school = yield serviceProxy.send({ module: 'school', cmd: 'school_read', data: { id } });
        if (school.success && school.data !== null) {
          // todo school表中的schoolType 是数组，班级表中是Number, 现只取第一个
          data.filters.schoolType = school.data.schoolType[0];
        }
      }
      const grade = yield serviceProxy.send({ module: 'school-class', cmd: 'grade_dict_read', data });
      res.api(grade.data);
    }).catch(next);
  }
}
module.exports = GradeDictController;

