const serviceProxy = require('../services/service-proxy');
const logger = require('xyj-logger').Logger('student-controller.js');
const _ = require('lodash');

class StudentClass {
  /**
   * 根据条件查询学生
   * @param req.query
   *  * id {String} 学生id
   * @param done {callback}
   */
  static find(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters', 'limit', 'skip', 'sort']);
    if (!data.filters.classId) {
      return serviceProxy
        .send({ module: 'school-class', cmd: 'student_read', data })
        .then((classData) => {
          if (!classData.success) {
            logger.error({ url: req.url, body: req.body, err: new Error(classData.msg) });
            return res.error({ code: 29999, msg: classData.msg });
          }
          return res.api(classData.data);
        })
        .catch(next);
    }
    // 如果查询班级下学生，不显示activeClass,拼装学生在该班级的学籍状态
    const classId = data.filters.classId;
    delete data.filters.classId;
    data.filters['activeClass._id'] = classId;
    return serviceProxy
      .send({ module: 'school-class', cmd: 'student_read', data })
      .then((studentData) => {
        if (!studentData.success) {
          logger.error({ url: req.url, body: req.body, err: new Error(studentData.msg) });
          return res.error({ code: 29999, msg: studentData.msg });
        }
        /* eslint-disable no-restricted-syntax */
        const students = [];
        for (const student of studentData.data) {
          for (const activeClass of student.activeClass) {
            if (activeClass._id === classId) {
              student.status = activeClass.status;
            }
          }
          delete student.activeClass;
          students.push(student);
        }
        return res.api(students);
      })
      .catch(next);
  }
  // 获取学生数量
  static count(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters']);
    if (data.filters.classId) {
      const classId = data.filters.classId;
      delete data.filters.classId;
      data.filters['activeClass._id'] = classId;
    }
    return serviceProxy.send({ module: 'school-class', cmd: 'student_count', data }).then((result) => {
      if (!result.success) {
        return res.error({ code: 29999, msg: result.msg });
      }
      return res.api(result.data);
    }).catch(next);
  }
  // 根据id查询学生信息
  static findById(req, res, next) {
    if (!req.params.id) {
      logger.error({ url: req.url, body: req.body, err: new Error('缺少必要的参数') });
      return res.error({ code: 29999, msg: '参数错误' });
    }
    return serviceProxy
      .send({ module: 'school-class', cmd: 'student_read_id', data: { id: req.params.id } })
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
module.exports = StudentClass;
