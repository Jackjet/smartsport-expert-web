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


const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsbSI6Im1hbmFnZW' +
  '1lbnQtdXNlciIsImlhdCI6MTQ4NDcyOTIzMywiZXhwIjoxNTcxMDQyODMzLCJzdWIiOiI1ODdlZGQy' +
  'YzRmZDgwNTY2YTRlN2I3MDMiLCJqdGkiOiI1ODdmMmI5MTk4ZTBiODJiNDZiMjk3NTYifQ.JX5bgJ-' +
  'fmgUzvxPu2Fyiy_KFP60Ihs1TroCsfXxD_dw';

describe('专家角色测试', () => {
  it('获取角色列表', (done) => {
    request(app)
      .get('/api/auth/expert_role')
      .set('Authorization', token)
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(0);
        done();
      });
  });
  it('获取指定角色', (done) => {
    request(app)
      .get('/api/auth/expert_role/58a118a1d832c34a35682a9b')
      .set('Authorization', token)
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(0);
        done();
      });
  });
  it('创建角色', (done) => {
    request(app)
      .post('/api/auth/expert_role')
      .set('Authorization', token)
      .send({
        name: '测试1', // 角色名
        permissions: [{
          _id: '589d5ba12cfc2127e709f428',
          code: 'expert_permission_read',
          name: '查看权限',
        },
          {
            _id: '589d5ba12cfc2127e709f42b',
            code: 'expert_role_create',
            name: '新增角色',
          },
        ], //权限
      })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(0);
        done();
      });
  });
  it('创建角色(缺少参数)', (done) => {
    request(app)
      .post('/api/auth/expert_role')
      .set('Authorization', token)
      .send({
        permissions: [{
          _id: '589d5ba12cfc2127e709f428',
          code: 'expert_permission_read',
          name: '查看权限',
        },
          {
            _id: '589d5ba12cfc2127e709f42b',
            code: 'expert_role_create',
            name: '新增角色',
          },
        ], //权限
      })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(29999);
        done();
      });
  });
  it('创建角色(非法权限)', (done) => {
    request(app)
      .post('/api/auth/expert_role')
      .set('Authorization', token)
      .send({
        name: '测试1', // 角色名
        permissions: [{
          _id: '589d5ba12cfc2127e709f4xx',
          code: 'expert_permission_read',
          name: '查看权限',
        },
        ], //权限
      })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(29999);
        done();
      });
  });
  it('修改角色', (done) => {
    request(app)
      .put('/api/auth/expert_role/58a118a1d832c34a35682a9b')
      .set('Authorization', token)
      .send({
        name: 'tester12345',
      })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(0);
        done();
      });
  });
  it('修改角色(缺少参数)', (done) => {
    request(app)
      .put('/api/auth/expert_role/58a118a1d832c34a35682a9b')
      .set('Authorization', token)
      .send({})
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(29999);
        done();
      });
  });
  it('修改角色(非法权限)', (done) => {
    request(app)
      .put('/api/auth/expert_role/58a118a1d832c34a35682a9b')
      .set('Authorization', token)
      .send({
        permissions: [{
          _id: '589d5ba12cfc2127e709f4xx',
          code: 'expert_permission_read',
          name: '查看权限',
        },
        ],
      })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(29999);
        done();
      });
  });
  it('删除角色', (done) => {
    request(app)
      .delete('/api/auth/expert_role/58a118a1d832c34a35682a9b')
      .set('Authorization', token)
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.status.code).to.be.equal(0);
        done();
      });
  });
});
