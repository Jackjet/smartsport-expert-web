/**
 * Created by ljm on 16-8-26.
 */
'use strict';

const common = require('./common');
const BASE = common.BASE;
const sendRequest = common.sendRequest;

const ACTIONS = [
  'RevertRpc',
  'PushByteMessage',
  'Pub',
  'Sub',
  'UnSub',
  'DeviceGrant',
  'DeviceRevokeById',
  'DeviceRevokeByTopic',
  'DevicePermitModify',
  'ListDevicePermits',
  'RegistDevice'
];

const API_URL = 'https://iot.aliyuncs.com/';

class IOT extends BASE {
  constructor(options, acts) {
    acts = acts || ACTIONS;
    super(options);
    const self = this;
    const actions = typeof acts === 'string' ? [acts] : acts;
    actions.forEach(action => {
      this[action] = this[action.replace(/(\w)/, v => v.toLowerCase())] = (opts, method) => {
        this.params = Object.assign({Action: action}, self.options, opts);
        this.params.SignatureNonce = Math.random();
        this.params.Timestamp = new Date().toISOString();
        return sendRequest(API_URL, this.params, self.secret, method);
      }
    })
  }
}

module.exports = IOT;
