const proxy = require('../services/service-proxy');

const MODULE = 'school';

class SchoolController {

  // 学校详情
  static getSchool(req, res, next) {
    const id = req.params.id;

    proxy.send({ module: MODULE, cmd: 'school_read', data: { id } })
      .then((result) => {
        if (!result.data) res.error({ code: 40400, msg: '学校不存在' });
        res.api(result.data);
      })
      .catch(next);
  }

  // 学校列表
  static getSchools(req, res, next) {
    proxy.send({ module: MODULE, cmd: 'school_find', data: req.query })
      .then((result) => {
        const promises = result.data.map((school) => {
          const mc = {
            module: 'gov-agency',
            cmd: 'gov_read_id',
            data: { id: school.gov_agency }
          };
          return proxy.send(mc)
            .then((govResult) => {
              if (!govResult.success) {
                return Object.assign(school, { 'gov_agency': { _id: school.gov_agency } });
              }
              return Object.assign(school, { 'gov_agency': govResult.data })
            });
        });
        return Promise.all(promises)
          .then((schools) => {
            res.api(schools);
          });
      })
      .catch(next);
  }

  // 查询总数
  static getTotal(req, res, next) {
    proxy.send({ module: MODULE, cmd: 'school_count', data: req.query })
      .then(result => res.api(result.data))
      .catch(next);
  }

  // 创建学校
  static createSchool(req, res, next) {
    const createdBy = req.user && req.user.sub;
    if (!createdBy) return res.error({ code: 40100, msg: '未知用户' });
    return proxy.send({ module: MODULE, cmd: 'school_create', data: Object.assign({ createdBy }, req.body) })
      .then((result) => {
        if (result.errors) return res.error({ code: 40000, msg: '创建失败', errors: result.errors });
        res.api(result.data);
      })
      .catch(next);
  }

  // 更新学校信息
  static updateSchool(req, res, next) {
    const data = Object.assign({}, { entity: req.body }, { id: req.params.id });
    proxy.send({ module: MODULE, cmd: 'school_update', data })
      .then((result) => {
        if (result.errors) res.error({ code: 40000, msg: '更新失败', errors: result.errors });
        res.api(result.data);
      })
      .catch(next);
  }

}

module.exports = SchoolController;
