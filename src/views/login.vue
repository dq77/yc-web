<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import { validatePassword } from '../utils.js'

const router = useRouter()

const userStore = useUserStore()

// do not use same name with ref
const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const loginFormRef = ref()

const onSubmit = async () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      await userStore.login(form)
      router.push({ path: '/' })
      loading.value = false
    } else {
      console.log('error submit!!')
      return false
    }
  })
}
const loginRules = reactive({
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }, { min: 1, max: 10, message: '长度在10个字符以内', trigger: 'blur' }],
  password: [{ required: true, trigger: 'blur', validator: validatePassword }]
})

const passwordType = ref('password')

</script>
<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-main">
        <div class="welcome">欢迎使用语橙</div>
        <div class="tips">用户登录</div>
        <el-form :model="form" :rules="loginRules" ref="loginFormRef">
          <el-form-item label="" prop="username">
            <el-input v-model="form.username" placeholder="请输入账号" size="large"/>
          </el-form-item>
          <el-form-item label="" prop="password">
            <el-input v-model="form.password" placeholder="请输入密码" size="large" :type="passwordType" />
            <svg class="icon password-eye" @click="passwordType = passwordType === 'password' ? 'text' : 'password'" aria-hidden="true">
              <use :xlink:href="`#icon-${passwordType === 'password' ? 'biyan1' : 'zhengyan1'}`"></use>
            </svg>
          </el-form-item>
          <el-form-item label="">
            <el-button class="login-btn" type="primary" @click="onSubmit">登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.login-page{
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('../assets/login-bg.jpg');
  background-size: cover;
  background-position: center;
  .login-box{
    width: 400px;
    padding-right: 720px;
    .login-main{
      background-color: #fff;
      padding: 40px;
      box-shadow: 0px 10px 25px 0px rgba(112,112,112,0.14);
      border-radius: 12px;
      .welcome{
        font-size: 24px;
        line-height: 24px;
        color: #000000;
        text-align: center;
        margin: 10px 0 50px;
      }
      .tips{
        font-size: 16px;
        margin-bottom: 24px;
      }
      .el-input{
        background-color: #F8F8F8;
        border-radius: 4px;
        .el-input__wrapper{
          background-color: #F8F8F8;
          padding: 0;
          .el-input__inner{
            padding: 1px 15px;
          }
        }
      }
      .password-eye{
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 10px;
        font-size: 20px;
      }
      .login-btn{
        height: 40px;
        width: 100%;
        border-width: 0px;
        background: linear-gradient( 270deg, #975AFF 0%, #5184FF 100%);
        margin-bottom: 130px;
        &:hover{
          background: linear-gradient( 270deg, #a978fd 0%, #779ffd 100%);
        }
      }
    }
  }
}
</style>
