const serviceProxy = require('../services/service-proxy');
const _ = require('lodash');
const Promise = require('bluebird');
const fs = require('fs');
const xlsx = require('node-xlsx');

/**
 * 类型转换，例如低转换为1，正常转换为2，高转换为3
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

/**
 * 返回报告属性字段
 * @param type {Number} 1-骨密度，2-心肺功能， 3-脊柱功能， 4-体成份， 5-血管机能
 * @return {*}
 */
function getReportProperty(type) {
  if (type === '1') { // 骨密度
    // [ '序号', '学号', '姓名', '性别', '体测类型', '年龄', '测评次数',
    // '测试部位', 'T值', 'Z值', '骨强度指数 ', '骨质情况', '%年轻人', '%同龄人','骨折风险倍数', '评测时间' ]
    return ['order', 'num', 'name', 'sex', 'type', 'age', 'count',
      'data.part', 'data.TValue', 'data.ZValue', 'data.intensityExponent', 'data.situation',
      'data.percentageYoungAdult', 'data.percentagePeer', 'data.fractureRiskMultiple', 'time'];
  } else if (type === '2') { // 心肺功能
    // [ '序号', '学号', '姓名', '性别', '年龄', '体测类型', '测评次数', '有锻炼情况',
    // '身高', '体重', '1级功率心率（次/分）', '2级功率心率（次/分）', 'F.C心肺功能(MET)',
    // '心肺功能标准', '心肺功能评语', '最大摄氧量相对值 ', '最大摄氧量绝对值 ', '评测时间' ]
    return ['order', 'num', 'name', 'sex', 'age', 'type', 'count',
      'data.exercise', 'data.height', 'data.weight', 'data.firstPowerRate', 'data.secondPowerRate',
      'data.functionalCapacity', 'data.cardioStandard', 'data.cardioComment',
      'data.maxOxygenUptakeValues', 'data.maxAbsoluteOxygenUptake', 'time'];
  } else if (type === '3') { // 脊柱功能
    // [ '序号', '学号', '姓名', '性别', '年龄', '体测类型', '测评次数', '评测时间', '测试部位',
    // '直立(Th1/2)', '直立(Th2/3)', '直立(Th3/4)', '直立(Th4/5)',
    // '直立(Th5/6)',
    // '直立(Th6/7)', '直立(Th7/8)', '直立(Th8/9)', '直立(Th9/10)',
    // '直立(Th10/11)',
    // '直立(Th11/12)', '直立(Th12/L1)', '直立(ThL1/L2)', '直立(ThL2/L3)'
    // '直立(ThL3/L4)',
    // '直立(ThL4/L5)', '直立(ThL5/S1)', '直立(Sac/Hip)', '直立评价',
    // '直立－前屈(Th1/2)',
    // '直立－前屈(Th2/3)', '直立－前屈(Th3/4)', '直立－前屈(Th4/5)',
    // '直立－前屈(Th5/6)',
    // '直立－前屈(Th6/7)', '直立－前屈(Th7/8)', '直立－前屈(Th8/9)',
    // '直立－前屈(Th9/10)',
    // '直立－前屈(Th10/11)', '直立－前屈(Th11/12)', '直立－前屈(Th12/L1)',
    // '直立－前屈(ThL1/L2)',
    // '直立－前屈(ThL2/L3)', '直立－前屈(ThL3/L4)', '直立－前屈(ThL4/L5)',
    // '直立－前屈(ThL5/S1)',
    // '直立－前屈评价', '直立－负重(Th1/2)', '直立－负重(Th2/3)', '直立－负重(Th3/4)',
    // '直立－负重(Th4/5)', '直立－负重(Th5/6)', '直立－负重(Th6/7)', '直立－负重(Th7/8)',
    // '直立－负重(Th8/9)', '直立－负重(Th9/10)', '直立－负重(Th10/11)', '直立－负重(Th11/12)',
    // '直立－负重(Th12/L1)', '直立－负重(ThL1/L2)', '直立－负重(ThL2/L3)', '直立－负重(ThL3/L4)',
    // '直立－负重(ThL4/L5)', '直立－负重(ThL5/S1)', '直立－负重评价', '胸椎曲度值',
    // '胸椎曲度值级别',
    // '腰椎曲度值', '腰椎曲度值级别', '脊柱形态分析', '腰部疼痛综合症风险',
    // '腰椎（椎间盘）疾病风险',
    // '综合评分', '结果建议' ],
    return ['order', 'num', 'name', 'sex', 'age', 'type', 'count', 'time', 'data.part',
      'data.spineErect.Th1/2', 'data.spineErect.Th2/3', 'data.spineErect.Th3/4', 'data.spineErect.Th4/5',
      'data.spineErect.Th5/6',
      'data.spineErect.Th6/7', 'data.spineErect.Th7/8', 'data.spineErect.Th8/9', 'data.spineErect.Th9/10',
      'data.spineErect.Th10/11',
      'data.spineErect.Th11/12', 'data.spineErect.Th12/L1', 'data.spineErect.L1/L2', 'data.spineErect.L2/L3',
      'data.spineErect.L3/L4',
      'data.spineErect.L4/L5', 'data.spineErect.L5/S1', 'data.spineErect.Sac/Hip', 'data.spineErectEvaluate',
      'data.spineProneness.Th1/2',
      'data.spineProneness.Th2/3', 'data.spineProneness.Th3/4', 'data.spineProneness.Th4/5',
      'data.spineProneness.Th5/6',
      'data.spineProneness.Th6/7', 'data.spineProneness.Th7/8', 'data.spineProneness.Th8/9',
      'data.spineProneness.Th9/10',
      'data.spineProneness.Th10/11', 'data.spineProneness.Th11/12', 'data.spineProneness.Th12/L1',
      'data.spineProneness.L1/L2',
      'data.spineProneness.L2/L3', 'data.spineProneness.L3/L4', 'data.spineProneness.L4/L5',
      'data.spineProneness.L5/S1',
      'data.spinePronenessEvaluate', 'data.spineLoad.Th1/2', 'data.spineLoad.Th2/3', 'data.spineLoad.Th3/4',
      'data.spineLoad.Th4/5', 'data.spineLoad.Th5/6', 'data.spineLoad.Th6/7', 'data.spineLoad.Th7/8',
      'data.spineLoad.Th8/9', 'data.spineLoad.Th9/10', 'data.spineLoad.Th10/11', 'data.spineLoad.Th11/12',
      'data.spineLoad.Th12/L1', 'data.spineLoad.L1/L2', 'data.spineLoad.L2/L3', 'data.spineLoad.L3/L4',
      'data.spineLoad.L4/L5', 'data.spineLoad.L5/S1', 'data.spineLoadEvaluate', 'data.thoracicCurvature',
      'data.thoracicCurvatureLevel',
      'data.lumbarCurvature', 'data.lumbarCurvatureLevel', 'data.spinalShape', 'data.lumbarPainSyndromesRisk',
      'data.lumbarDiseaseRisk',
      'data.score', 'data.spineSuggestion'];
  } else if (type === '4') { // 体成份
    // [ '序号', '学号', '姓名', '性别', '年龄', '体测类型', '测评次数', '评测时间',
    // '身高', '身高标准', '体重', '体重标准', '去脂体重',
    // '肌肉量', '肌肉量级别',
    // '身份水分', '细胞内液', '细胞外液', '蛋白质',
    // '推定骨量', '脂肪量', '体脂肪率',
    // '体脂肪率类型', '身体质量指数 ', '身体质量类型', '基础代谢', '总能量代谢',
    // '浮肿指数', '浮肿指数级别', '内脏脂肪数值',
    // '内脏脂肪等级 ', '内脏脂肪面积',
    // '内脏脂肪含量', '皮下脂肪含量', '腰臀比数值', '腰臀比级别', '腹部肥胖类型',
    // '肥胖分布类型', '左上肢肌肉量', '左上肢脂肪量',
    // '左上肢脂肪率', '右上肢肌肉量',
    // '右上肢脂肪量', '右上肢脂肪率', '躯干肌肉量',
    // '躯干脂肪量', '躯干脂肪率',
    // '左下肢肌肉量', '左下肢脂肪量', '左下肢脂肪率',
    // '右下肢肌肉量', '右下肢肌肉量',
    // '右下肢脂肪率', '目标体重', '体重控制', '脂肪控制',
    // '肌肉控制', '综合评分' ],
    return ['order', 'num', 'name', 'sex', 'age', 'type', 'count', 'time',
      'data.height', 'data.heightLevel', 'data.weight', 'data.weightLevel', 'data.degreaseWeight',
      'data.muscle', 'data.muscleLevel',
      'data.bodyMoisture', 'data.intracellularFluid', 'data.extracellularFluid', 'data.protein',
      'data.bone', 'data.fat', 'data.bodyFat',
      'data.bodyFatLevel', 'data.BMI', 'data.BMILevel', 'data.basalMetabolic', 'data.energyMetabolism',
      'data.swellingIndex', 'data.swellingIndexLevel', 'data.viscelralFatRating',
      'data.viscelralFatRatingLevel', 'data.VFAMRI',
      'data.visceralAdiposity', 'data.subcutaneousFatContent', 'data.WHR', 'data.WHRLevel', 'data.abdominalObesity',
      'data.fatDistribution', 'data.leftUpperLimbMuscle', 'data.leftUpperLimbFat',
      'data.leftUpperLimbBodyFat', 'data.rightUpperLimbMuscle',
      'data.rightUpperLimbFat', 'data.rightUpperLimbBodyFat', 'data.torsoUpperLimbMuscle',
      'data.torsoUpperLimbFat', 'data.torsoUpperLimbBodyFat',
      'data.leftLowerLimbMuscle', 'data.leftLowerLimbFat', 'data.leftLowerLimbBodyFat',
      'data.rightLowerLimbMuscle', 'data.rightLowerLimbFat',
      'data.rightLowerLimbBodyFat', 'data.goalWeight', 'data.weightControl', 'data.fatControl',
      'data.muscleControl', 'data.score'];
  }
  // 血管机能
  // [ '序号', '学号', '姓名', '性别', '年龄', '体测类型', '测评次数', '评测时间',
  // '身高''体重', '心率（次/分）', '身体质量指数',
  // '右臂血压-舒张压', '右臂血压-收缩压',
  // '右臂-脉压', '右臂血压标准', '左臂血压-舒张压',
  // '左臂血压-收缩压', '左臂-脉压',
  // '左臂血压标准', '右踝血压-舒张压', '右踝血压-收缩压',
  // '右踝-脉压', '左踝血压-舒张压',
  // '左踝血压-收缩压', '左踝-脉压', '左踝（PWV)',
  // '左踝血管弹性级别', '右踝（PWV)',
  // '左踝血管弹性级别', '左踝血管弹性同龄人相比%',
  // '右踝血管弹性同龄人相比%', '左踝血管弹性Z值',
  // '右踝血管弹性Z值', '左踝血管阻塞值', '左踝血管阻塞程度',
  // '右踝血管阻塞值', '右踝血管阻塞程度',
  // '血管弹性程度（PWV）评价', '血管阻塞程度（ABI）评价' ]
  return ['order', 'num', 'name', 'sex', 'age', 'type', 'count', 'time',
    'data.height', 'data.weight', 'data.heartRate', 'data.BMI',
    'data.rightArmBloodPressureDBP', 'data.rightArmBloodPressureSBP',
    'data.rightArmBloodPressurePP', 'data.rightArmBloodPressure', 'data.leftArmBloodPressureDBP',
    'data.leftArmBloodPressureSBP', 'data.leftArmBloodPressurePP',
    'data.leftArmBloodPressure', 'data.rightAnkleBloodPressureDBP', 'data.rightAnkleBloodPressureSBP',
    'data.rightAnkleBloodPressurePP', 'data.leftAnkleBloodPressureDBP',
    'data.leftAnkleBloodPressureSBP', 'data.leftAnkleBloodPressurePP', 'data.leftAnklePWV',
    'data.leftAnkleLevelPWV', 'data.rightAnklePWV',
    'data.rightAnkleLevelPWV', 'data.leftAnklePercentagePeerPWV',
    'data.rightAnklePercentagePeerPWV', 'data.leftAnkleZValuePWV',
    'data.rightAnkleZValuePWV', 'data.leftAnkleABI', 'data.leftAnkleABILevel',
    'data.rightAnkleABI', 'data.rightAnkleABILevel',
    'data.veinSuggestion.PWV', 'data.veinSuggestion.ABI'];
}

class ConstitutionController {
  /**
   * 创建或编辑体质报告
   * @param req
   * @param res
   * @param next
   * @return {Promise|Promise.<T>}
   */
  static createOrUpdate(req, res, next) {
    const userId = req.user.sub;
    const body = req.body;
    const params = req.params;
    if (!body.student) {
      return res.error({ code: 29999, msg: '缺少必要参数学生id' });
    }
    return Promise.resolve().then(() => {
      const data = body;
      // 创建体质报告
      if (req.method.toUpperCase() === 'POST') {
        data.createBy = userId;
        return serviceProxy.send({ module: 'body-test-management', cmd: 'constitution_create', data });
      }
      // 修改体质报告
      data.id = params.id;
      return serviceProxy.send({ module: 'body-test-management', cmd: 'constitution_update', data });
    }).then((result) => {
      if (!result.success) {
        return res.error({ code: 29999, msg: result.msg });
      }
      return res.api(result.data);
    }).catch(next);
  }

  /**
   *  条件查询体质报告条数
   * @param req
   * @param res
   * @param next
   * @returns {Promise|Promise.<T>}
   */
  static count(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters']);
    return serviceProxy.send({ module: 'body-test-management', cmd: 'constitution_count', data }).then((result) => {
      if (!result.success) {
        return res.error({ code: 29999, msg: result.msg });
      }
      return res.api(result.data);
    }).catch(next);
  }

  /**
   * 查询体质报告列表
   * @param req
   * @param res
   * @param next
   * @returns {Promise|Promise.<T>}
   */
  static get(req, res, next) {
    const query = req.query;
    const data = _.pick(query, ['filters', 'limit', 'skip', 'sort']);
    return serviceProxy.send({ module: 'body-test-management', cmd: 'constitution_read', data }).then((result) => {
      if (!result.success) {
        return res.error({ code: 29999, msg: result.msg });
      }
      const constitution = result.data;
      const studentList = [];
      constitution.forEach((item) => {
        studentList.push(item.student);
      });
      return Promise.props({
        constitution,
        student: serviceProxy
          .send({
            module: 'school-class',
            cmd: 'student_read',
            data: { filters: { _id: { $in: studentList } } } }),
      });
    }).then((props) => {
      const constitution = props.constitution;
      for (let i = 0; i < constitution.length; i += 1) {
        constitution[i].student = _.find(props.student.data, { _id: constitution[i].student });
      }
      return res.api(constitution);
    }).catch(next);
  }

  /**
   * 根据id查询体质报告详情
   * @param req
   * @param res
   * @param next
   * @return {Promise.<T>|Promise}
   */
  static getById(req, res, next) {
    const params = req.params;
    const id = params.id;
    return serviceProxy
      .send({ module: 'body-test-management', cmd: 'constitution_read_id', data: { id } })
      .then((result) => {
        if (!result.success) {
          return res.error({ code: 29999, msg: result.msg });
        }
        return res.api(result.data);
      }).catch(next);
  }

  /**
   * 下载体质报告模版
   * @param req
   * @param res
   * @param next
   */
  static template(req, res) {
    const type = req.query.type;
    if (type !== '1' && type !== '2' && type !== '3' && type !== '4' && type !== '5') {
      return res.error({ code: 29999, msg: 'type参数错误' });
    }
    let name = '';
    switch (type) {
      case '1':
        name = '骨密度评估报告模版';
        break;
      case '2':
        name = '心肺功能评估报告模版';
        break;
      case '3':
        name = '脊柱功能评估报告模版';
        break;
      case '4':
        name = '体成份评估报告模版';
        break;
      case '5':
        name = '血管机能评估报告模版';
        break;
      default:
        name = '体成份评估报告模版';
        break;
    }
    return fs.readFile(`./public/template/${name}.xls`, 'binary', (err, file) => {
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
   * 导入体制报告
   * @param req
   *  query.type {String} 1-骨密度，2-心肺功能， 3-脊柱功能， 4-体成份， 5-血管机能
   * @param res
   * @param next
   * @return {Promise|Promise.<TResult>}
   */
  static import(req, res, next) {
    const userId = req.user.sub;
    const type = req.query.type;
    if (type !== '1' && type !== '2' && type !== '3' && type !== '4' && type !== '5') {
      return res.error({ code: 29999, msg: 'type参数错误' });
    }
    if (!req.files || !req.files.files || !req.files.files.path) {
      return res.error({ code: 29999, msg: '请上传文件' });
    }
    const filePath = req.files.files.path;
    const propertyName = getReportProperty(type);
    const workbook = xlsx.parse(fs.readFileSync(filePath));
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
        // 每条数据添加统一属性
        data[i].createBy = userId;
        const once = _.find(student, { name: data[i].name, num: (data[i].num && data[i].num.toString()) });
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
      return serviceProxy.send({ module: 'body-test-management', cmd: 'constitution_insertMany', data });
    }).then((result) => {
      if (!result.success) {
        return res.error({ code: 29999, msg: result.msg });
      }
      return res.api({
        success: true,
        total: data.length,
        successConut: result.data.length,
        failConut: (data.length - result.data.length),
        notHasStudent: notStudentNum,
      });
    }).catch(next);
  }
}

module.exports = ConstitutionController;
