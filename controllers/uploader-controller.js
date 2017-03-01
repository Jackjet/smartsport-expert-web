const aliyun = require('../utils/aliyun');

const oss = aliyun.OSS.smartSport;

exports.getExpertKnowledgePolicy = (req, res, next) => (
  oss.getPolicy({ dir: 'knowledge' })
    .then(policy => res.api(policy))
    .catch(next)
);
