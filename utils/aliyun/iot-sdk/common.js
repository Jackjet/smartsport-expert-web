/**
 * Created by ljm on 16-8-25.
 */
'use strict';

const Promise = require('bluebird');
const crypto = require('crypto');
const request = Promise.promisify(require('request'));

const DEFAULTS = {
  AccessKeyId: '',
  // Signature: '',
  SignatureMethod: 'HMAC-SHA1',
  Format: 'json',
  Version: '2014-05-26',
  SignatureVersion: '1.0',
  SignatureNonce: Math.random(),
  Timestamp: new Date().toISOString()
};

exports.BASE = class BASE {
  constructor(options) {
    this.options = Object.assign({}, DEFAULTS, options);
    this.secret = this.options.AccessKeySecret;
    delete this.options.AccessKeySecret;
  }
};

const escaper = str => encodeURIComponent(str).replace(/\*/g, '%2A').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\+/, '%2b');

const getSignature = (params, secret, method) => {
  method = method || 'get';
  const canoQuery = Object.keys(params).sort().map(key => `${escaper(key)}=${escaper(params[key])}`).join('&');
  const stringToSign = `${method.toUpperCase()}&${escaper('/')}&${escaper(canoQuery)}`;
  let signature = crypto.createHmac('sha1', `${secret}&`);
  signature = signature.update(stringToSign).digest('base64');
  return escaper(signature);
};


exports.sendRequest = (host, params, secret, options) => {
  params = params || {};
  options = options || {};
  let method = options.method || 'get';
  let timeout = options.timeout || 5000;
  const signature = getSignature(params, secret, method);

  if (method === 'get') {
    const query = Object.keys(params).sort().map(key => `${escaper(key)}=${escaper(params[key])}`).join('&');
    const url = `${host}?${query}&Signature=${signature}`;
    let message = {
      url: url,
      method: 'GET',
      json: true
    };
    return request(message).then(res => res.body);
  } else {
    params.Signature = signature;
    let message = {
      method: method.toUpperCase(),
        url: host,
      headers: [{
        name: 'content-type',
        value: 'application/x-www-form-urlencoded'
      }],
      timeout: parseInt(timeout, 10),
      form: params,
      json: true
    };
    return request(message).then(res => res.body);
  }
};
