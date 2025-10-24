import request from '@/utils/request'

export function loginApi(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}
// 根据Token获取用户信息
export function getInfoApi(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

// 获取登录用户拥有的所有角色及对应的菜单权限
export function getUserRoleList(data) {
  return request({
    url: '/role/userRole',
    method: 'post',
    data
  })
}
// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/user/list',
    method: 'get',
    params
  })
}

export function editUser(data) {
  return request({
    url: '/user/edit',
    method: 'post',
    data
  })
}

export function addUser(data) {
  return request({
    url: '/user/add',
    method: 'post',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: '/user/delete',
    method: 'post',
    data
  })
}

export function changePassword(data) {
  return request({
    url: '/user/password',
    method: 'post',
    data
  })
}
