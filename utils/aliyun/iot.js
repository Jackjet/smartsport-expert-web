'use strict';

const Promise = require('bluebird');
const moment = require('moment');
const mongoose = require('mongoose');

const IOT = require('./iot-sdk/iot');
const conf = require('./aliyun-config');
const errorLogger = require('../log-service').errorLogger;
const debugLogger = require('../log-service').debugLogger;

const DeviceDailyAnalytics = mongoose.model('DeviceDailyAnalytics');
let iotConf = conf.iot;
iotConf.AccessKeyId = conf.AccessKeyId;
iotConf.AccessKeySecret = conf.AccessKeySecret;

const iot = new IOT(iotConf);

var api = {

  /**
   *发布信息到指定 topic
   * @param opts
   *  * MessageContent  {String}  发送的消息，将消息内容二进制进行BASE64转码后得到的字符串
   *  * MacAddress  {String}  物理地址
   * @param cb
   *  - err
   *  - result {failObj|succesObj}
   * @returns {Promise|*}
   *  成功时传入：
   *  - successObj
   *    - RequestId {String}
   *    - success {Boolean} 是否发送成功;如果发送失败时
   *  失败时传入：
   *  - failObj
   *    - RequestId {String}
   *    - Message {String} 失败返回信息，成功时
   *    - HostId {String} 失败时请求的域名，成功时
   *    - Code {String} 错误码，成功时
   */
  pub: wrap('pub'),

  /**
   * 设备授权
   *
   * @param opts
   *  * DeviceName  {String}  设备的标识ID
   *  * GrantType  {String}  PUB,SUB,ALL
   *  * MacAddress  {String}  物理地址
   * @param cb
   * @returns {Promise}
   *  成功时传入：
   *  - successObj
   *    - RequestId {String}
   *    - success {Boolean} 是否发送成功;如果发送失败时
   *  失败时传入：
   *  - failObj
   *    - RequestId {String}
   *    - Message {String} 失败返回信息，成功时
   *    - HostId {String} 失败时请求的域名，成功时
   *    - Code {String} 错误码，成功时
   *    - errorMessage
   */
  deviceGrant: wrap('DeviceGrant'),

  /**
   * 设备注册
   *
   * @param opts
   *  * DeviceName  {String}  可选的，自定义设备名称，不传则由系统生成默认与deviceId一致
   * @param cb
   * @returns {Promise}
   *  成功时传入：
   *  - successObj
   *    - RequestId {String}
   *    - success {Boolean} 是否发送成功;如果发送失败时
   *    - DeviceName {String} 设备
   *    - DeviceId {String}
   *  失败时传入：
   *  - failObj
   *    - RequestId {String}
   *    - Message {String} 失败返回信息，成功时
   *    - HostId {String} 失败时请求的域名，成功时
   *    - Code {String} 错误码，成功时
   *    - errorMessage
   */
  registDevice: wrap('RegistDevice')
};

module.exports = api;

function wrap(method, version) {
  return function (options, cb) {
    let opts = {};
    Object.assign(opts, options);

    return Promise.resolve(opts)
      .then(opts => { // iot 版本问题
        if (version === conf.iot20160104.Version) {
          Object.assign(opts, opts, conf.iot20160104);
        }
        if (opts.MacAddress) opts.MacAddress = opts.MacAddress.toUpperCase();
        return opts;
      })
      .then(opts => { // 分析日志
        return logIOTAnalytics(opts.MacAddress).then(() => opts).catch(e => {
          errorLogger.error({
            code: 500,
            msg: 'Fail to log Analytics: ' + e.message
          });
          return opts;
        });
      })
      .then(opts => { // 处理物理地址问题
        if (opts.MacAddress) {
          let appkey = iotConf.ProductKey;
          let topicName = appkey + '/devices/' + opts.MacAddress;
          delete opts.MacAddress;
          opts.TopicFullName = topicName;
        }
        return opts;
      })
      .then(opts => { // 发送内容序列化
        if (opts.MessageContent) {
          let content = opts.MessageContent;
          if (typeof opts.MessageContent !== 'string') {
            content = JSON.stringify(content)
          }
          debugLogger.debug(opts.MessageContent);
          opts.MessageContent = new Buffer(content).toString('base64');
        }
        if (method.toLowerCase() === 'pub') opts.Qos = opts.Qos || 1;
        return opts;
      })
      .then(opts => {
        return iot[method](opts);
      })
      .then(resObj => {
        return cb ? cb(null, resObj) : resObj;
      })
      .catch(e => {
        if (!cb) return Promise.reject(e);
        cb(e);
      });
  }
}

function logIOTAnalytics(macAddress) {
  let analyticsDate = moment().format('YYYY-MM-DD');
  return Promise.resolve()
    .then(() => {
      return DeviceDailyAnalytics.findOne({macAddress, analyticsDate});
    })
    .then(analy => {
      if (!analy) {
        let iotReceivedTimes = 1;
        return new DeviceDailyAnalytics({macAddress, analyticsDate, iotReceivedTimes}).save();
      }
      analy.iotReceivedTimes += 1;
      return analy.save();
    });
}
