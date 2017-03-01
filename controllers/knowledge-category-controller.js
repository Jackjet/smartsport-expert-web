const serviceProxy = require('../services/service-proxy');

const role = 'knowledge';

class Controller {

  // 添加分类
  static create(req, res, next) {
    serviceProxy.send({ module: role, cmd: 'knowledge-category-create', data: req.body })
      .then((result) => {
        if (!result.success) {
          return res.error({ code: 40000, msg: result.msg || '创建失败' });
        }
        return res.api(result.data);
      })
      .catch(next);
  }

  // 更新分类
  static update(req, res, next) {
    const data = {
      id: req.params.id,
      entity: req.body,
    };
    serviceProxy.send({ module: role, cmd: 'knowledge-category-update', data })
      .then(result => res.api(result.data))
      .catch(next);
  }

  // 查看分类
  static read(req, res, next) {
    let id = req.params.id;
    if (id === 'all') id = null;
    const data = Object.assign({ id }, req.query);
    serviceProxy.send({ module: role, cmd: 'knowledge-category-read', data })
      .then(result => res.api(result.data))
      .catch(next);
  }

  static delete(req, res, next) {
    serviceProxy.send({ module: role, cmd: 'knowledge-category-delete' })
      .then(result => res.api(result.data))
      .catch(next);
  }
}

module.exports = Controller;
