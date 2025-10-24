import instancelk from '@/utils/request2'

export function uploadMediaByPath(params) {
  return instancelk({
    url: '/media/uploadMediaByPath',
    method: 'get',
    params
  })
}

export function getOssTempPath(params) {
  return instancelk({
    url: '/oss/getTempPath',
    method: 'get',
    params
  })
}

export function queryMediaById(params) {
  return instancelk({
    url: '/media/queryMediaById',
    method: 'get',
    params
  })
}

export function asrAnalysis(params) {
  return instancelk({
    url: '/media/asrAnalysis',
    method: 'get',
    params
  })
}

export function queryCopywritingById(params) {
  return instancelk({
    url: '/copywriting/queryCopywritingById',
    method: 'get',
    params
  })
}

export function splitMedia(data) {
  return instancelk({
    url: '/split/splitMedia',
    method: 'post',
    data
  })
}

export function querySplitMedia(params) {
  return instancelk({
    url: '/split/querySplitMedia',
    method: 'get',
    params
  })
}
