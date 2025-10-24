import request from '@/utils/request'

export function getMediaList(params) {
  return request({
    url: '/media/list',
    method: 'get',
    params
  })
}

export function addMedia(data) {
  return request({
    url: '/media/add',
    method: 'post',
    data
  })
}

export function saveMedia(data) {
  return request({
    url: '/media/save',
    method: 'post',
    data
  })
}

export function exportMedia(data) {
  return request({
    url: '/media/export',
    method: 'post',
    data
  })
}

export function removeMedia(data) {
  return request({
    url: '/media/remove',
    method: 'post',
    data
  })
}

