'use strict';
const nconf = require('nconf');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const AuthenticateStrategy = require('./middleware/passport-permission');

const serviceProxy = require('./services/service-proxy');

const jwtOpts = {
  secretOrKey: nconf.get('secret'),
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
};

// 封装权限管理为passport
passport.use('permission', new AuthenticateStrategy());
passport.use(new JwtStrategy(jwtOpts, jwtVerify));

/**
 * jwt鉴权验证
 * @param payload {Object} 解析token的参数
 *  * realm {String} 角色名
 *  * iat {Number} 创建时间
 *  * exp {Number} 过期时间
 *  * sub {String} 帐号id
 *  * jti {String} token id
 * @param done
 * @returns {*}
 */
function jwtVerify(payload, done) {
  const jti = payload.jti;
  if (!jti) {
    return done('Invalid token due to jwt has no jti.', payload);
  }
  return serviceProxy.send({ module: 'auth', cmd: 'revokeToken_read', data: { id: jti } }, (err, token) => {
    if (err) {
      return done(err);
    } else if (!token || !token.active) {
      return done(null, false);
    }
    return done(null, payload);
  });
}
