export default [
  {
    name: 'work',
    label: '工作台',
    value: false,
    action: [],
  },
  {
    name: 'account',
    label: '账号管理',
    value: false,
    action: [
      { name: 'accountAdd', label: '添加账号', value: false },
      { name: 'accountEnable', label: '启用/禁用账号', value: false },
      { name: 'accountReset', label: '重置密码', value: false },
      { name: 'accountRole', label: '更改角色', value: false },
    ],
  },
  {
    name: 'role',
    label: '角色管理',
    value: false,
    action: [
      { name: 'roleAdd', label: '添加角色', value: false },
      { name: 'roleEnable', label: '启用/禁用角色', value: false },
      { name: 'roleEdit', label: '编辑', value: false },
      { name: 'roleDelete', label: '删除', value: false },
    ],
  },
  {
    name: 'history',
    label: '历史记录',
    value: false,
    action: [
      { name: 'historyExport', label: '导出', value: false },
      { name: 'historyDelete', label: '删除', value: false },
    ],
  },
]