import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { loginApi, getInfoApi, getUserRoleList } from '@/api/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'


export const useUserStore = defineStore('userStore', () => {
  const token = ref('')
  const userInfo = ref({})
  const role = ref('')
  const actions = ref([])
  const router = useRouter()

  const login = async(formData) => {
    const res = await loginApi(formData)
    if (res.code === 0) {
      setToken(res.data.jwtToken)
      token.value = res.data.jwtToken
    }
    return res
  }

  const getInfo = async() => {
    const infoRes = await getInfoApi(token.value)
    if (infoRes.code === 0) {
      if (!infoRes.data) {
        ElMessage.error('未获取到账号信息，请重新登录')
        return logout()
      }
      const { user_role } = infoRes.data
      
      // 角色权限保存
      const roleRes = await getUserRoleList({ roles: [user_role] })
      role.value = roleRes.data[0].role_menu.filter(item => item.value)

      userInfo.value = infoRes.data

      role.value.forEach(roleItem => {
        if (roleItem.value) {
          actions.value.push(roleItem.name)
        }
        roleItem.action.forEach(actionItem => {
          if (actionItem.value) {
            actions.value.push(actionItem.name)
          }
        })
      })
    }
    return infoRes
  }

  const permission = (name) => {
    return actions.value.includes(name)
  }

  const logout = () => {
    token.value = ''
    userInfo.value = {}
    role.value = ''
    actions.value = []
    removeToken()
    router.push('/login')
  }

  return {token, userInfo, role, actions, login, getInfo, logout, permission }
})
