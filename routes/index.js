const express = require('express');
const passport = require('passport');
const glob = require('glob');

const router = express.Router();
const logger = require('xyj-logger').Logger('route');

// 401验证
router.use('/api/auth', passport.authenticate('jwt', { session: false }));

// ps:index路由不应该手动注册任何路由
// 所有路由文件请以-routes.js结尾,此处会自动加载(如有特殊需求,请添加到ignore中,然后手动处理)
// 路由路径会加上/api,然后与目录结构保持一致
// 如: user-routes.js  => /api/user   ||  test/test-routes.js => /api/test/test
// 文件夹或文件名中所有-会被替换为下划线
// 如: test-1/test-2-routes.js => /api/test_1/test_2
const routes = glob.sync('**/*-routes.js', { cwd: './routes', mark: true, ignore: ['index.js'] });
routes.map((route) => {
  const path = `/api/${route.split('-routes.js')[0].replace(/-/g, '_')}`;
  /* eslint-disable import/no-dynamic-require,global-require */
  logger.debug('注册路由:', path, `./${route}`);
  return router.use(path, require(`./${route}`));
});


module.exports = router;
