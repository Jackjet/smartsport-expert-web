/**
 * Created by ljm on 16-9-14.
 */
'use strict';

require('../../../../nconf');
require('../../../../mongoose');
const iot = require('../../iot');

const Promise = require('bluebird');
// Promise.resolve()
//   .then(() => iot.registDevice())
//   .then(result => {
//     // console.log(result)
//     return iot.deviceGrant({MacAddress: 'E0:B9:4D:64:3C:3B', GrantType: 'ALL', DeviceName: "0pyCTB9DhrrtuGZvy"});
//   })
//   .then(result => {
//     console.log('result',result)
//   })
//   .catch(e => {
//     console.error(e.stack)
//   });

Promise.resolve()
  .then(() => {
    return iot.pub({MacAddress: 'aaa:bb', MessageContent: 'jjjjjj'})
  })
  .catch(e => {
    console.log(e.stack);
  });