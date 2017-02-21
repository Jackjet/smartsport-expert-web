const seneca = require('seneca');

function allfunc() {
  this.add('role:auth, cmd:revokeToken_read', (msg, done) => {
    done(null, { _id: '587f2b9198e0b82b46b29756',
      uid: '587edd2c4fd80566a4e7b703',
      __v: 0,
      timestamp: '2017-01-18T08:47:13.802Z',
      active: true });
  });

  this.add('role:auth, cmd:revokeToken_create', (msg, done) => {
    done(null, { _id: '123456789' });
  });

  this.add('role:auth, cmd:*', (msg, done) => {
    done(null, { success: true, msg: '成功' });
  });
}
// 关闭打印信息
seneca({ log: 'silent' })
  .use(allfunc)
  .listen({ type: 'http', port: 10001 });
