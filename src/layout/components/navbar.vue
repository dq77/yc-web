<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowDown } from '@element-plus/icons-vue'
import changePassword from '@/views/account/components/changePassword.vue'


const router = useRouter()
const activeIndex = ref('/work')
const userStore = useUserStore()
const handleSelect = (key) => {
  router.push(key)
}
const opacity = computed(() => {
  return router.currentRoute.value.path === '/work'
})
watch(() => router.currentRoute.value.path, (path) => {
  activeIndex.value = '/' + path.split('/')[1]
})

onMounted(() => {
  activeIndex.value = '/' + router.currentRoute.value.path.split('/')[1]
})

const logout = () => {
  userStore.logout()
  router.push('/login')
}

const passwordVisible = ref(false)
const setPassword = () => {
  passwordVisible.value = true
}

const passwordClose = () => {
  passwordVisible.value = false
}

</script>
<template>
  <div :class="['nav-page', { 'nav-page-opacity': opacity }]">
    <div class="logo">
      <img src="../../assets/logo.png" width="220px">
    </div>
    <el-menu :default-active="activeIndex" mode="horizontal" @select="handleSelect">
      <el-menu-item
        v-for="item in userStore.role"
        :key="item.name"
        :index="`/${item.name}`"
        :disabled="!item.value"
        >{{ item.label }}</el-menu-item>
    </el-menu>
    <el-dropdown placement="bottom-end">
      <div class="user-info">
        <img src="../../assets/user.png">
        <div class="user-name">{{ userStore.userInfo?.user_name }}</div>
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="setPassword">修改密码</el-dropdown-item>
          <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <change-password :visible="passwordVisible" @update:visible="passwordClose"></change-password>
  </div>
</template>
<style lang="scss">
.nav-page{
  height: 60px;
  display: flex;
  background-color: #fff;
  .logo{
    display: flex;
    align-items: center;
    padding-left: 20px;
  }
  .el-menu--horizontal{
    flex: 1;
    border-bottom: 0px;
    .el-menu-item{
      margin: 0 20px;
      padding: 4px 0 0 ;
      transition: none;
      border-bottom: 4px solid transparent;
      color: #333;
      &.is-active{
        border-bottom: 4px solid #5b44ed;
        border-image: linear-gradient(to right, #5184FF, #975AFF) 1;
        color: #333!important;
      }
      &:hover, &:focus{
        background-color: transparent;
      }
    }
  }
  .user-info{
    display: flex;
    align-items: center;
    padding-right: 30px;
    &:focus-visible{
      outline: none;
    }
    .user-name{
      padding-left: 14px;
      cursor: default;
    }
  }
}
.nav-page.nav-page-opacity{
  background-color: transparent;
  position: relative;
  z-index: 4;
  .el-menu{
    background-color: transparent;
  }
}
</style>
