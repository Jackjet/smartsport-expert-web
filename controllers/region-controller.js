const serviceProxy = require('../services/service-proxy');

class RegionController {
  // 省市区三级联动数据，可用Object.keys进行遍历获取对应省市区
  static geRegion(req, res, next) {
    serviceProxy.send({ module: 'region', cmd: 'region3_read' }, (err, result) => {
      if (err) return next(err);
      const region = result.data;
      // 去掉无用信息
      delete region._id;
      delete region.__v;
      return res.api(region);
    });
  }
}
module.exports = RegionController;
