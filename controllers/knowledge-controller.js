const serviceProxy = require('../services/service-proxy');
const _ = require('lodash');
const Promise = require('bluebird');

/**
 * 校验用户是否有审核权限
 * @param id
 * @returns {Promise|Promise.<TResult>|*}
 */
function ownAudit(id) {
  return serviceProxy.send({ module: 'expert-user', cmd: 'user_read_id', data: { id } }).then((result) => {
    if (!result.success) {
      return false;
    }
    const roleid = result.data.role;
    return serviceProxy
      .send({ module: 'expert-user',
        cmd: 'role_read',
        data: { filters: { _id: roleid, 'permissions.code': 'knowledge_audit' } } })
      .then((role) => {
        if (!role.success || role.data.length === 0) {
          return false;
        }
        return true;
      });
  });
}

/**
 * 查询或插入知识标签
 * @param tags {Array} 标签数组
 * @return data {Array} 标签的id数组
 */
function upsertTags(tags) {
  const list = [];
  if (Array.isArray(tags)) {
    tags.forEach((item) => {
      list.push(serviceProxy.send({ module: 'knowledge', cmd: 'knowledge_tag_upsert', data: { name: item } }));
    });
  } else {
    list.push(serviceProxy.send({ module: 'knowledge', cmd: 'knowledge_tag_upsert', data: { name: tags } }));
  }
  return Promise.all(list).then((result) => {
    const data = [];
    result.forEach((item) => {
      data.push(item.data && item.data._id);
    });
    return data;
  });
}

class KnowledgeController {

  /**
   * 创建知识
   * @param req
   * @param res
   * @param next
   * @return {Promise|Promise.<T>}
   */
  static createOrUpdate(req, res, next) {
    const userId = req.user.sub;
    const body = req.body;
    const params = req.params;
    const tags = body.tags || [];
    // TODO 分类处理
    // 标签处理，查询或者创建，返回id数组
    return Promise.props({
      tags: upsertTags(tags),
    }).then((props) => {
      const data = body;
      data.tags = props.tags;
      if (req.method.toUpperCase() === 'POST') { // 创建知识
        data.createBy = userId;
        data.status = 0; // 默认待审核状态
        return serviceProxy.send({ module: 'knowledge', cmd: 'knowledge_create', data });
      }
      // 修改知识
      data.id = params.id;
      return serviceProxy.send({ module: 'knowledge', cmd: 'knowledge_update', data });
    }).then((result) => {
      if (!result.success) {
        return res.error({ code: 29999, msg: result.msg });
      }
      return res.api(result.data);
    }).catch(next);
  }

  /**
   *  条件查询知识条数
   * @param req
   * @param res
   * @param next
   * @returns {Promise|Promise.<T>}
   */
  static count(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters']);
    const userId = req.user.sub;
    // 检查用户有没有审核权限
    return ownAudit(userId).then((bol) => {
      if (!bol) {
        data.filters.createBy = userId;
      }
      return serviceProxy.send({ module: 'knowledge', cmd: 'knowledge_count', data }).then((result) => {
        if (!result.success) {
          return res.error({ code: 29999, msg: result.msg });
        }
        return res.api(result.data);
      });
    }).catch(next);
  }

  /**
   * 查询知识列表，只返回审核通过的数据
   * @param req
   * @param res
   * @param next
   * @returns {Promise|Promise.<T>}
   */
  static get(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters', 'limit', 'skip', 'sort']);
    const userId = req.user.sub;
    let knowledge = [];
    // 检查用户有没有审核权限
    return ownAudit(userId).then((bol) => {
      if (!bol) {
        data.filters.createBy = userId;
      }
      return serviceProxy.send({ module: 'knowledge', cmd: 'knowledge_read', data });
    }).then((result) => {
      if (!result.success) {
        return res.error({ code: 29999, msg: result.msg });
      }
      knowledge = result.data;
      // 所有使用的标签
      let tagList = [];
      // 所有使用的类型
      const typeList = [];
      knowledge.forEach((item) => {
        tagList = tagList.concat(item.tags);
        typeList.push(item.type);
      });
      // TODO 是否需要关联查询出分类
      return Promise.props({
        tags: serviceProxy.send({ module: 'knowledge', cmd: 'knowledge_tag_read', data: { _id: { $in: tagList } } }),
        type: serviceProxy.send({ module: 'knowledge', cmd: 'knowledge_type_read', data: { _id: { $in: typeList } } }),
      });
    }).then((props) => {
      for (let i = 0; i < knowledge.length; i += 1) {
        // id替换类型数据
        knowledge[i].type = _.find(props.type.data, { _id: knowledge[i].type });
        // id替换标签数据
        for (let j = 0; j < knowledge[i].tags.length; j += 1) {
          knowledge[i].tags[j] = _.find(props.tags.data, { _id: knowledge[i].tags[j] });
        }
      }
      return res.api(knowledge);
    })
      .catch(next);
  }

  /**
   * 根据id查询知识详情
   * @param req
   * @param res
   * @param next
   * @returns {Promise|Promise.<T>}
   */
  static getById(req, res, next) {
    const params = req.params;
    const id = params.id;
    const userId = req.user.sub;
    // TODO 是否需要关联查询出分类
    return serviceProxy.send({ module: 'knowledge', cmd: 'knowledge_read_id', data: { id } }).then((result) => {
      if (!result.success) {
        return res.error({ code: 29999, msg: result.msg });
      }
      return Promise.props({
        knowledge: result.data,
        tags: serviceProxy.send({ module: 'knowledge', cmd: 'knowledge_tag_read', data: { $in: result.data.tags } }),
        type: serviceProxy
          .send({ module: 'knowledge', cmd: 'knowledge_type_read_id', data: { id: result.data.type } }),
        audit: ownAudit(userId),
      });
    }).then((props) => {
      const knowledge = props.knowledge;
      knowledge.type = props.type.data;
      for (let i = 0; i < knowledge.tags.length; i += 1) {
        knowledge.tags[i] = _.find(props.tags.data, { _id: knowledge.tags[i] });
      }
      // 是否有审核权限
      knowledge.audit = props.audit;
      res.api(knowledge);
    }).catch(next);
  }

  /**
   * 审核知识
   * @param req
   * @param res
   * @param next
   * @returns {Promise|Promise.<T>}
   */
  static audit(req, res, next) {
    const userId = req.user.sub;
    const params = req.params;
    const id = params.id;
    const body = req.body || {};
    if (!body.status) {
      return res.error({ code: 29999, msg: '缺少status参数!' });
    }
    const data = {
      id,
      status: body.status,
      auditBy: userId,
      auditAt: new Date(),
      comments: [{
        commentAt: new Date(),
        commentBy: userId,
        commentType: 1,
        content: (body.comments && body.comments.content) || '',
      }],
    };
    return serviceProxy.send({ module: 'knowledge', cmd: 'knowledge_read_id', data: { id } }).then((knowledge) => {
      if (!knowledge.success) {
        return res.error({ code: 29999, msg: knowledge.msg });
      }
      // 获取已存在的注释
      data.comments = data.comments.concat(knowledge.data.comments);
      return serviceProxy.send({ module: 'knowledge', cmd: 'knowledge_update', data }).then((result) => {
        if (!result.success) {
          return res.error({ code: 29999, msg: result.msg });
        }
        return res.api({ success: true });
      });
    }).catch(next);
  }

  /**
   * 获取知识库所有类型
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<T>|Promise}
   */
  static getType(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters', 'limit', 'skip', 'sort']);
    return serviceProxy.send({ module: 'knowledge', cmd: 'knowledge_type_read', data }).then((result) => {
      if (!result.success) {
        return res.error({ code: 29999, msg: result.msg });
      }
      return res.api(result.data);
    }).catch(next);
  }

  /**
   * 查询当前用户是否有审核权限
   * @param req
   * @param res
   * @param next
   */
  static getOwnAudit(req, res, next) {
    const userId = req.user.sub;
    ownAudit(userId)
      .then(bol => res.api(bol))
      .catch(next);
  }
}

module.exports = KnowledgeController;
