const seneca = require('seneca');

function allfunc() {
  this.add('role:expert-user, cmd:role_read', (msg, done) => {
    done(null, {
      success: true,
      msg: '成功',
      data: [
        {
          _id: '589d5cd1a7fca426846e2fef',
          name: 'hello',
          createBy: '5886b54bf029dd5b8de3f332',
          __v: 0,
          createdAt: '2017-02-10T06:25:21.832Z',
          permissions: [
            {
              name: '查看权限',
              code: 'expert_permission_read',
              _id: '589d5ba12cfc2127e709f428',
            },
            {
              name: '新增角色',
              code: 'expert_role_create',
              _id: '589d5ba12cfc2127e709f42b',
            },
          ],
        },
        {
          _id: '589d5d15a7fca426846e2ff1',
          name: 'hello2',
          createBy: '5886b54bf029dd5b8de3f332',
          __v: 0,
          createdAt: '2017-02-10T06:26:29.252Z',
          permissions: [
            {
              name: '查看权限',
              code: 'expert_permission_read',
              _id: '589d5ba12cfc2127e709f428',
            },
            {
              name: '新增角色',
              code: 'expert_role_create',
              _id: '589d5ba12cfc2127e709f42b',
            },
          ],
        },
        {
          _id: '589d621cd49b3428db240eec',
          name: 'hello3',
          createBy: '5886b54bf029dd5b8de3f332',
          __v: 0,
          createdAt: '2017-02-10T06:47:56.418Z',
          permissions: [
            {
              _id: '589d5ba12cfc2127e709f428',
              code: 'expert_permission_read',
              name: '查看权限',
            },
            {
              _id: '589d5ba12cfc2127e709f42b',
              code: 'expert_role_create',
              name: '新增角色',
            },
          ],
        },
        {
          _id: '58a118a1d832c34a35682a9b',
          name: 'helloxxxxxxxx',
          createBy: '5886b54bf029dd5b8de3f332',
          __v: 0,
          createdAt: '2017-02-13T02:23:29.057Z',
          permissions: [
            {
              _id: '589d5ba12cfc2127e709f428',
              code: 'expert_permission_read',
              name: '查看权限',
            },
          ],
        },
      ],
    });
  });
  this.add('role:expert-user, cmd:permission_read', (msg, done) => {
    done(null, { success: true,
      msg: '成功',
      data: [
        {
          _id: '589d5ba12cfc2127e709f427',
          name: '权限管理',
          __v: 0,
          permissions: [
            {
              name: '查看权限',
              code: 'expert_permission_read',
              _id: '589d5ba12cfc2127e709f428',
            },
          ],
        },
        {
          _id: '589d5ba12cfc2127e709f429',
          name: '角色管理',
          __v: 0,
          permissions: [
            {
              name: '查看角色',
              code: 'expert_role_read',
              _id: '589d5ba12cfc2127e709f42a',
            },
            {
              name: '新增角色',
              code: 'expert_role_create',
              _id: '589d5ba12cfc2127e709f42b',
            },
            {
              name: '编辑角色',
              code: 'expert_role_update',
              _id: '589d5ba12cfc2127e709f42c',
            },
          ],
        },
        {
          _id: '589d5ba12cfc2127e709f42d',
          name: '用户管理',
          __v: 0,
          permissions: [
            {
              name: '查看用户',
              code: 'expert_user_read',
              _id: '589d5ba12cfc2127e709f42e',
            },
            {
              name: '新增用户',
              code: 'expert_user_create',
              _id: '589d5ba12cfc2127e709f42f',
            },
            {
              name: '编辑用户',
              code: 'expert_user_update',
              _id: '589d5ba12cfc2127e709f430',
            },
            {
              name: '重置密码',
              code: 'expert_user_reset_password',
              _id: '589d5ba12cfc2127e709f431',
            },
          ],
        },
      ],
    });
  });
  this.add('role:expert-user, cmd:user_read', (msg, done) => {
    done(null, {
      success: true,
      msg: '成功',
      data: [
        {
          _id: '58a15a843196b46549595989',
          accountId: 'thisisatest',
          name: 'test',
          tel: '13800138000',
          email: 'expert@163.com',
          identityCardIcon: 'http://zhappian.com',
          identityCardNum: '44010xxxxxxxxxxxx',
          expertTeam: {
            _id: '589d1ab275ad211cc6974bac',
            name: 'tester1486690994462',
            expertType: 2,
            createdBy: 'Mr wu',
            __v: 0,
            createdAt: '2017-02-10T01:43:14.272Z',
            status: 1,
            address: '小公园',
            region: {
              province: '广东省',
              city: '汕头市',
              area: '金平区',
            },
          },
          role: {
            _id: '58a12810c20c97560e9e6b77',
            name: 'tester',
            createBy: '588022b6e926ac56d1bf9793',
            __v: 0,
            createdAt: '2017-02-13T03:29:20.147Z',
            permissions: [
              {
                name: '查看角色',
                code: 'expert_role_read',
                _id: '588022b6e926ac56d1bf9993',
              },
            ],
          },
          status: 1,
          createdBy: '5886b54bf029dd5b8de3f332',
          createdAt: '2017-02-13T07:04:36.783Z',
          updatedAt: '2017-02-13T07:04:36.783Z',
          __v: 0,
        },
      ],
    });
  });
  // 需要返回data数据的,请在*之前注册并直接返回需要的数据
  // 默认不需要data数据可以直接忽略该步骤
  this.add('role:expert-user, cmd:*', (msg, done) => {
    done(null, { success: true, msg: '成功' });
  });
}
// 关闭打印信息
seneca({ log: 'silent' })
  .use(allfunc)
  .listen({ type: 'http', port: 10008 });
