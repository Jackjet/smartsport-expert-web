const expect = require('chai').expect;
const request = require('supertest');

require('../nconf');
const nconf = require('nconf');
const Logger = require('xyj-logger');

const lconf = nconf.get('logger');
// 修改logger配置,不打印在console和不写logfile,防止干扰
lconf.consoleLevel = 0;
lconf.fileLevel = 0;
Logger.config(lconf);
const app = require('../server');
require('../passport');
require('./services/auth-service');
require('./services/expert-user-service');
require('./services/expert-team-service');


const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsbSI6Im1hbmFnZW' +
  '1lbnQtdXNlciIsImlhdCI6MTQ4NDcyOTIzMywiZXhwIjoxNTcxMDQyODMzLCJzdWIiOiI1ODdlZGQy' +
  'YzRmZDgwNTY2YTRlN2I3MDMiLCJqdGkiOiI1ODdmMmI5MTk4ZTBiODJiNDZiMjk3NTYifQ.JX5bgJ-' +
  'fmgUzvxPu2Fyiy_KFP60Ihs1TroCsfXxD_dw';

describe('专家账号测试', () => {
  it('获取用户列表', (done) => {
    request(app)
      .get('/api/auth/expert_user')
      .set('Authorization', token)
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(0);
        done();
      });
  });
  it('获取用户数量', (done) => {
    request(app)
      .get('/api/auth/expert_user/count')
      .set('Authorization', token)
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(0);
        done();
      });
  });
  it('创建用户账号', (done) => {
    request(app)
      .post('/api/auth/expert_user')
      .set('Authorization', token)
      .send({
        accountId: 'thisisatest',
        name: 'test',
        tel: '13800138000',
        email: 'expert@163.com',
        password: '1234567890',
        identityCardIcon: 'http://zhappian.com',
        identityCardNum: '44010xxxxxxxxxxxx',
        expertTeam: '589d1ab275ad211cc6974bac',
        role: '58a12810c20c97560e9e6b77',
        status: 1,
      })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(0);
        done();
      });
  });
  it('创建用户账号(参数错误)', (done) => {
    request(app)
      .post('/api/auth/expert_user')
      .set('Authorization', token)
      .send({
        name: 'tester12345',
        password: 'tester12345',
        status: 0,
        role: '587dd51ef47773b38b66b48b',
      })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(29999);
        expect(res.body.status.msg).to.be.equal('参数错误');
        done();
      });
  });
  it('修改账号信息', (done) => {
    request(app)
      .put('/api/auth/expert_user/tester12345')
      .set('Authorization', token)
      .send({
        name: 'tester12345',
        password: 'tester12345',
        status: 1,
        role: 'yyyyy',
      })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(0);
        done();
      });
  });
  it('修改账号信息(参数错误)', (done) => {
    request(app)
      .put('/api/auth/expert_user/tester12345')
      .set('Authorization', token)
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(29999);
        expect(res.body.status.msg).to.be.equal('参数错误');
        done();
      });
  });
  it('修改账号信息(修改自己账号)', (done) => {
    request(app)
      .put('/api/auth/expert_user/587edd2c4fd80566a4e7b703')
      .set('Authorization', token)
      .send({
        name: 'tester12345',
        password: 'tester12345',
        status: 1,
        role: 'yyyyy',
      })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(29999);
        expect(res.body.status.msg).to.be.equal('非法操作');
        done();
      });
  });
});
