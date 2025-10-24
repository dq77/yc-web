import router from './router'

import { useUserStore } from './stores/user'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth' // get token from cookie
import { asyncRoute } from './router'


const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  console.log(to.fullPath)
  const userStore = useUserStore()


  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      const hasRole = userStore.role
      if (hasRole) {
        next()
      } else {
        try {
          // 获取用户信息
          await userStore.getInfo()
          // 根据权限配置动态路由
          let firstRoutePath = '' // 第一个有权限的路由 用于/重定向
          asyncRoute.forEach(item => {
            if (userStore.permission(item.name)) {
              if (!firstRoutePath) { firstRoutePath = item.path }
              router.addRoute('index', item)
            }
          })
          if (to.path === '/') {
            next({ path: firstRoutePath })
          } else {
            next({ ...to, replace: true })
          }
        } catch (error) {
          await userStore.logout()
          // ElMessage.error(error || '该用户未授权')
          next(`/login?redirect=${to.path}`)
        }
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})
