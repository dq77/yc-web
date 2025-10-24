import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import { getToken, setToken, removeToken } from '@/utils/auth'

const instancelk = axios.create({
  baseURL: '/lkapi',
  timeout: 50000
})

instancelk.interceptors.request.use(
  config => {
    if (getToken()) {
      config.headers['Authorization'] = `Bearer ${getToken()}`
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

instancelk.interceptors.response.use(
  response => {
    const res = response.data

    if (res.code !== '00000' && res.code !== '10001') {
      ElMessage({
        message: res.message || 'Error',
        type: 'error',
        duration: 5000
      })
      if (res.code === 401) {
        const userStore = useUserStore()
        userStore.logout()
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error)
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default instancelk
