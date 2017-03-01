/**
 * Created by ljm on 16-10-8.
 */
const config = {
  // 基本配置
  AccessKeyId: ' LTAIrYssPr9rexbD',
  AccessKeySecret: 'UfLuOuUBqXJ6kPwP44HG6wztiDfHRU',
  // iot
  iot: {
    Version: '2016-05-30',
    Format: 'json',
    RegionId: 'cn_hangzhou',
    ProductKey: '1000097279'
  },
  // version 2016-01-04
  iot20160104: {
    Version: '2016-01-04',
    Format: 'json',
    RegionId: 'cn_hangzhou',
    AppKey: '1000097279'
  },
  // oss
  oss: {
    endpoint: 'https://oss-cn-shenzhen.aliyuncs.com',
    region: 'oss-cn-shenzhen',
    smartSportBucket: 'smartsport-root-test'
  }
};

module.exports = config;
