<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { editUser, changePassword } from '@/api/user'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../../stores/user'
import { validatePassword } from '@/utils'

const emit = defineEmits(['update:visible', 'reflash']);

const handleClose = (done) => {
  formData.user_id = ''
  formData.oldPassword = ''
  formData.password = ''
  formData.password2 = ''
  emit('update:visible', false);
  formRef.value.clearValidate()
}

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  row: {
    type: Object,
    default: () => ({})
  }
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    formData.user_id = props.row.user_id
  }
})
const formRef = ref()

const formData = reactive({
  user_id: '',
  oldPassword: '',
  password: '',
  password2: ''
})

const validatePass = (rule, value, callback) => {
  if (formData.password !== formData.password2) {
    callback(new Error('两次输入的密码不一致，请重新输入'))
  } else {
    callback()
  }
}


const handleSubmit = async () => {
  const userStore = useUserStore()
  await formRef.value.validate(
    async (valid) => {
      if (!valid) {
        return
      }
      const params = {
        user_id: formData.user_id,
        oldPassword: formData.oldPassword,
        newPassword: formData.password,
      }
      const res = await changePassword(params)
      if (res.code !== 0) {
        ElMessage.error(res.msg)
        return
      }
      ElMessage.success('操作成功')
      if (formData.user_id) {
        emit('reflash')
        handleClose()
      } else {
        await userStore.logout()
      }
    }
  )
}


const rules = reactive({
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  password: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { required: true, trigger: 'blur', validator: validatePassword }],
  password2: [{ required: true, message: '请再次输入新密码', trigger: 'blur' },{ required: true, trigger: 'blur', validator: validatePass }]
})


</script>
<template>
  <el-dialog :model-value="visible" :title="props.row.user_id ? '重置密码' : '修改密码'" :before-close="handleClose" width="500">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item v-if="!props.row.user_id" label="旧密码" prop="oldPassword">
        <el-input v-model="formData.oldPassword" placeholder="请输入旧密码"></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="password">
        <el-input v-model="formData.password" placeholder="请输入新密码" autocomplete="new-password" type="password" :name="'ww' + Math.random().toString(36).substring(2)"></el-input>
      </el-form-item>
      <el-form-item label="重复新密码" prop="password2">
        <el-input v-model="formData.password2" placeholder="请重复新密码" autocomplete="new-password" type="password" :name="'ww' + Math.random().toString(36).substring(2)"></el-input>
      </el-form-item>
    </el-form>
      
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<style lang="scss">
.edit-dialog{
  width: 400px;
}
</style>
