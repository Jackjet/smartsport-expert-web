const seneca = require('seneca');

function allfunc() {
  this.add('role:expert-team, cmd:expertTeam_read', (msg, done) => {
    done(null, {
      success: true,
      msg: '成功',
      data: [
        {
          _id: '589d1ab275ad211cc6974bac',
          name: 'tester1486690994462',
          expertType: 2,
          createdBy: 'Mr wu',
          createdAt: '2017-02-10T01:43:14.272Z',
          status: 1,
          region: {
            province: '广东省',
            city: '汕头市',
            area: '金平区',
          },
          address: '小公园',
        },
      ],
    });
  });
  // 需要返回data数据的,请在*之前注册并直接返回需要的数据
  // 默认不需要data数据可以直接忽略该步骤
  this.add('role:expert-team, cmd:*', (msg, done) => {
    done(null, { success: true, msg: '成功' });
  });
}
// 关闭打印信息
seneca({ log: 'silent' })
  .use(allfunc)
  .listen({ type: 'http', port: 10007 });
