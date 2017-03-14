const serviceProxy = require('../services/service-proxy');

const role = 'sport-category';

class Controller {

  // 查看知识点
  static find(req, res, next) {
    serviceProxy.send({ module: role, cmd: 'knowledge_point_read', data: req.query })
      .then(result => res.api(result.data))
      .catch(next);
  }

}

module.exports = Controller;
