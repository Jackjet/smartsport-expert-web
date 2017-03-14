const serviceProxy = require('../services/service-proxy');
const _ = require('lodash');

class ClassDictController {
  static find(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters', 'limit', 'skip', 'sort']);
    return serviceProxy
      .send({ module: 'school-class', cmd: 'class_dict_read', data })
      .then((classData) => {
        if (!classData.success) {
          return res.error({ code: 29999, msg: classData.msg });
        }
        return res.api(classData.data);
      })
      .catch(next);
  }
}
module.exports = ClassDictController;
