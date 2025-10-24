import request from '@/utils/request'

export function getRoleListApi(params) {
  return request({
    url: '/role/list',
    method: 'get',
    params
  })
}

export function editRole(data) {
  return request({
    url: '/role/edit',
    method: 'post',
    data
  })
}

export function addRole(data) {
  return request({
    url: '/role/add',
    method: 'post',
    data
  })
}

export function deleteRole(data) {
  return request({
    url: '/role/delete',
    method: 'post',
    data
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
