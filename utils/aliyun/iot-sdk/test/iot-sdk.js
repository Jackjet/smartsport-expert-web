/**
 * Created by ljm on 16-8-26.
 */
'use strict';
const IOT = require('../iot');
const Promise = require('bluebird');

const conf = require('../../aliyun-config');
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
   *  * DeviceId  {String}  设备的标识ID
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
        // if (version === conf.iot20160530.Version) {
        //   Object.assign(opts, opts, conf.iot20160530);
        // }
        return opts;
      })
      .then(opts => { // 处理物理地址问题
        if (opts.MacAddress) {
          let appkey = iotConf.AppKey;
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
            content = JSON.stringify(content);
          }
          opts.MessageContent = new Buffer(content).toString('base64');
        }
        return opts;
      })
      .then(opts => {
        return iot[method](opts)
      })
      .then(resObj => {
        if (!cb) {
          return resObj;
        }
        cb(null, resObj);
      })
      .catch(e => {
        if (!cb) {
          throw e;
        }
        cb(e);
      });
  }
}

api.registDevice()
  .then(result => {
    console.log(result)
    return api.deviceGrant({MacAddress: '1111111', GrantType: 'ALL', DeviceId: result.DeviceId});
  })
  .then(result => {
    console.log(result)
  })
  .catch(e => {
    console.log(e.stack)
  });
