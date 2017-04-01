/**
 * 处方管理
 * @module exercise-prescription
 */

const serviceProxy = require('../services/service-proxy');
const role = "exercise-prescription";
const prifix = "exercise_prescription";

class ExercisePrescriptionController {
  // 创建
  static create(req, res, next) {
    const data = req.body;
    serviceProxy.send({ module: role, cmd: `${prifix}_create`, data })
      .then((result) => {
        if (result.success) {
          res.api(result.data);
        } else {
          res.error({ code: 29999, msg: result.msg || '创建失败' });
        }
      })
      .catch(next);
  }

  // 更新 
  static update(req, res, next) {
    const data = req.body;
    const id = req.params.id;
    Object.assign(data, { id });
    serviceProxy.send({ module: role, cmd: `${prifix}_update`, data })
      .then((result) => {
        if (result.success) {
          res.api(result.data);
        } else {
          res.error({ code: 29999, msg: result.msg || '更新失败' });
        }
      })
      .catch(next);
  }

  // 查找列表
  static find(req, res, next) {
    const data = req.query;
    serviceProxy.send({ module: role, cmd: `${prifix}_read`, data })
      .then((result) => {
        if (result.success) {
          res.api(result.data);
        } else {
          res.error({ code: 29999, msg: result.msg || '查找失败' });
        }
      })
      .catch(next);
  }
  
  // 获取列表总数
  static count(req, res, next) {
    const data = req.query;
    serviceProxy.send({ module: role, cmd: `${prifix}_count`, data })
      .then((result) => {
        if (result.success) {
          res.api(result.data);
        } else {
          res.error({ code: 29999, msg: result.msg || '查找失败' });
        }
      })
      .catch(next);
  }

  // 查找单条记录
  static findById(req, res, next) {
    const data = { 
      id: req.params.id,
    };
    serviceProxy.send({ module: role, cmd: `${prifix}_read_id`, data })
      .then((result) => {
        if (result.success) {
          res.api(result.data);
        } else {
          res.error({ code: 29999, msg: result.msg || '查找失败' });
        }
      })
      .catch(next);
  }

  // 删除
  static delete(req, res, next) {
    const data = { 
      id: req.params.id,
    };
    serviceProxy.send({ module: role, cmd: `${prifix}_delete`, data })
      .then((result) => {
        if (result.success) {
          res.api(result.data);
        } else {
          res.error({ code: 29999, msg: result.msg || '删除失败' });
        }
      })
      .catch(next);
  }
}

module.exports = ExercisePrescriptionController;
