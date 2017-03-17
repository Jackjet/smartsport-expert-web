const serviceProxy = require('../services/service-proxy');
const _ = require('lodash');
const Promise = require('bluebird');
const fs = require('fs');
const xlsx = require('node-xlsx');

/**
 * 类型转换，例如时间转换
 * @param key {String} 健
 * @param value {String|Number} 值
 * @return {*}
 */
function typeConvert(key, value) {
  let result = value;
  if (key === 'time') {
    // 从execl读取的时间数值转换为时间格式
    result = new Date(1900, 0, value);
  }
  return result;
}

/**
 * 数据工厂，返回处理excel列表后的数据
 * @param ary {Array} 属性列表
 * @param data {Object} 解析excel后的数据
 * @return {Array}
 */
function factory(ary, data) {
  const result = [];
  // 从1开始，不取第一行
  for (let i = 1; i < data.length; i += 1) {
    const obj = {};
    for (let j = 0; j < data[i].length; j += 1) {
      obj[ary[j]] = typeConvert(ary[j], data[i][j]);
    }
    result.push(obj);
  }
  return result;
}

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
    return Promise.resolve().then(() => {
      const data = body;
      // 创建体检报告
      if (req.method.toUpperCase() === 'POST') {
        data.createBy = userId;
        return serviceProxy.send({ module: 'body-test-management', cmd: 'medical_create', data });
      }
      if (!body.student) {
        return res.error({ code: 29999, msg: '缺少必要参数学生id' });
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
      const medical = result.data;
      const studentList = [];
      medical.forEach((item) => {
        studentList.push(item.student);
      });
      return Promise.props({
        medical,
        student: serviceProxy
          .send({
            module: 'school-class',
            cmd: 'student_read',
            data: { filters: { _id: { $in: studentList } } } }),
      });
    }).then((props) => {
      const medical = props.medical;
      for (let i = 0; i < medical.length; i += 1) {
        medical[i].student = _.find(props.student.data, { _id: medical[i].student });
      }
      return res.api(medical);
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

  /**
   * 删除体检报告
   * @param req
   * @param res
   * @param next
   * @return {Promise.<T>|Promise}
   */
  static delete(req, res, next) {
    const params = req.params;
    const id = params.id;
    return serviceProxy
      .send({ module: 'body-test-management', cmd: 'medical_delete', data: { id } })
      .then((result) => {
        if (!result.success) {
          return res.error({ code: 29999, msg: result.msg });
        }
        return res.api({ success: true });
      }).catch(next);
  }

  /**
   * 下载体检报告模版
   * @param req
   * @param res
   * @param next
   */
  static template(req, res) {
    const name = '体检报告模版';
    fs.readFile(`./public/template/${name}.xls`, 'binary', (err, file) => {
      if (err) {
        res.error({ code: 29999, msg: '找不到此文件' });
      } else {
        res.writeHead(200, {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}.xls";`,
        });
        res.write(file, 'binary');
        res.end();
      }
    });
  }

  /**
   * 导入体检报告
   * @param req
   * @param res
   * @param next
   * @return {Promise|Promise.<TResult>}
   */
  static import(req, res, next) {
    const userId = req.user.sub;
    if (!req.files || !req.files.files || !req.files.files.path) {
      return res.error({ code: 29999, msg: '请上传文件' });
    }
    const filePath = req.files.files.path;
    const workbook = xlsx.parse(fs.readFileSync(filePath));
    // [ '序号', '学号', '姓名', '性别', '年龄', '体检类型', '测评次数',
    // '总胆固醇', '总胆固醇标准', '甘油三脂', '甘油三脂标准', '高密度蛋白质胆固醇',
    // '高密度蛋白质胆固醇标准', '低密度蛋白质胆固醇', '低密度蛋白质胆固醇标准' , '评测时间'],
    const propertyName = ['order', 'num', 'name', 'sex', 'age',
      'type', 'count', 'totalChol', 'totalCholLevel', 'triglyceride',
      'triglycerideLevel', 'HDL-C', 'HDL-CLevel', 'LDL-C', 'LDL-CLevel', 'time'];
    // 构造数据存储数据库
    const data = factory(propertyName, workbook[0].data);
    // 有多少条数据无法对应上学生
    let notStudentNum = 0;
    return Promise.map(data, (item) => {
      // 查询关联的所有学生
      const filters = { name: item.name, num: item.num };
      return serviceProxy
        .send({ module: 'school-class', cmd: 'student_read', data: { filters } })
        .then(student => student.data[0]);
    }).then((student) => {
      // 匹配学生
      for (let i = 0; i < data.length; i += 1) {
        data[i].createBy = userId;
        const once = _.find(student, { name: data[i].name, num: data[i].num.toString() });
        if (!once) {
          notStudentNum += 1;
        } else {
          data[i].student = once._id;
          // TODO 如学生表改动需要改动
          data[i].school = once.activeSchool[0];
          // 班级处理
          once.activeClass.forEach((item) => {
            if (item.status === 1) {
              data[i].class = item._id;
            }
          });
        }
      }
      return serviceProxy.send({ module: 'body-test-management', cmd: 'medical_insertMany', data });
    }).then((medical) => {
      if (!medical.success) {
        return res.error({ code: 29999, msg: medical.msg });
      }
      return res.api({
        success: true,
        total: data.length,
        successConut: medical.data.length,
        failConut: (data.length - medical.data.length),
        notHasStudent: notStudentNum,
      });
    }).catch(next);
  }
}

module.exports = MedicalController;
