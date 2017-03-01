'use strict';

const OSS = require('ali-oss');
const co = require('co');
const moment = require('moment');
const uuidv4 = require('uuid/v4');

const conf = require('./aliyun-config');

const slice = [].slice;

function isGeneratorFunction (fn) {
  return typeof fn === 'function' &&
    fn.constructor &&
    fn.constructor.name === 'GeneratorFunction'
}

function wrap(oss, method) {
  return function() {
    let args = slice.apply(arguments);

    let fn = oss[method];

    let cb = args[args.length - 1];
    if (cb instanceof Function && !(cb instanceof Array)) { // if has callback
      return co(function * () {
        cb = args.pop();
        try {
          let obj;
          if (isGeneratorFunction(fn)) {
            obj = yield fn.apply(oss, args);
          } else {
            obj = fn.apply(oss, args);
          }

          return cb(null, obj);
        } catch (e) {
          return cb(e);
        }
      });
    } else {
      return co(function * () {
        if (isGeneratorFunction(fn)) {
          return yield fn.apply(oss, args);
        } else {
          return fn.apply(oss, args);
        }
      });
    }
  }
}

OSS.prototype.getPolicy = function (options) {
  let accessid = this.options.accessKeyId;
  let host = `${this.options.protocol || 'http'}://${this.options.bucket}.${this.options.endpoint.host}`;

  let expire = options.expire || 30;
  let expiration = new Date(new Date().getTime() + expire);

  let dir = options.dir || '';

  let policy = {
    expiration: moment(expiration).format('YYYY-MM-DDTHH:mm:ss.000') + 'Z',
    conditions: [
      ["content-length-range", 0, 1048576000],
      ['starts-with', '$key', '']
    ]
  };
  let base64Policy = new Buffer(JSON.stringify(policy)).toString('base64');
  let signature = this.signature(base64Policy);

  return {
    accessid,
    host,
    signature,
    dir,
    key: `${dir}/${uuidv4()}`,
    policy: base64Policy,
    expire: Math.floor(expiration.getTime() / 1000),
  }
};

let apiList = [
  /**
   *获取存储对象的流
   *
   * @param filename {String} 对象名
   * @param cb
   *  - resObj
   *    - stream {IncomingMessage}
   *    - res
   *      - status {Number}
   *      - headers {Object}
   */
  'getStream',
  'get',

  /**
   * 把流发送到oss
   *
   * @param name {String}
   * @param stream {ReadableStream}
   * @param cb
   *  - err
   *  - resObj
   */
  'put',
  'putStream',
  'list',
  'deleteMulti',
  'getObjectUrl',
  'signatureUrl',
  'getPolicy',
  'putBucket',
  'getBucketACL',
  'putBucketACL'
];

module.exports = function(bucket) {
  let ossConf = conf.oss;
  let oss = new OSS({
    accessKeyId: conf.AccessKeyId,
    accessKeySecret: conf.AccessKeySecret,
    endpoint: ossConf.endpoint,
    region: ossConf.region,
    bucket,
  });

  let api = {};

  apiList.forEach(method => {
    api[method] = wrap(oss, method);
  });

  return api;
};
