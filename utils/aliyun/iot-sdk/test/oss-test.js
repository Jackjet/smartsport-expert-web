/**
 * Created by ljm on 16-10-6.
 */
const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));

request({
  url: 'http://bbcloud-firmware-test.oss-cn-shenzhen.aliyuncs.com/bbcloud-firmware-rootfs_rtl_v0.15.20160914.tar.bz2?OSSAccessKeyId=C6LaVmIDtu1KWQQy&Expires=1475748683&Signature=KaQRtQDzmRCTKpUxDTJPpfkTGl4%3D',
  method: 'OPTIONS',
}, (a, b, c) => {
  console.log(b.headers);
});