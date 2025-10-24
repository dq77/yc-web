<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { editUser, addUser } from '@/api/user'
import { getRoleListApi } from '@/api/role'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { validatePassword } from '@/utils.js'
const emit = defineEmits(['update:visible', 'reflash']);
const userStore = useUserStore()

const handleClose = (done) => {
  emit('update:visible', false);
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

const formRef = ref()

const formData = reactive({
  userName: '',
  password: '',
  userRole: '',
  account_state: '',
  group_info: '',
  is_grouper: 0
})

watch(() => props.visible, (newVal) => {
  if (newVal) {
    formData.userName = props.row.user_name
    formData.password = props.row.user_password
    formData.userRole = props.row.user_role
    formData.account_state = props.row.account_state
    formData.group_info = props.row.group_info
    formData.is_grouper = props.row.is_grouper || 0
    if (props.row.user_id) {
      // 用户编辑时 占位用于过密码校验 没其他意义 后端不存
      formData.password = '123456'
    }
    setTimeout(() => formRef.value.clearValidate(), 0)
  }
})

const handleSubmit = async () => {
  await formRef.value.validate(
    async (valid) => {
      if (!valid) {
        return
      }
      let requestApi = editUser
      const params = {
        user_id: props.row.user_id,
        userName: formData.userName,
        password: formData.password,
        roles: formData.userRole,
        account_state: formData.account_state,
        group_info: formData.group_info || '',
        is_grouper: formData.is_grouper
      }
      if (!props.row.user_id) {
        requestApi = addUser
      }
      const res = await requestApi(params)
      if (res.code !== 0) {
        ElMessage.error(res.msg)
        return
      }
      ElMessage.success('操作成功')
      emit('reflash')
      handleClose()
    }
  )
}

const title = computed(() => {
  return props.row.user_id ? '编辑账号' : '添加账号'
})

const setDefaultPass = () => {
  formData.password = 'yucheng2025'
  setTimeout(() => {
    formRef.value.clearValidate('password')
  }, 0)
}

const rules = reactive({
  userName: [{ required: true, message: '请输入账号名称', trigger: 'blur' }, { min: 1, max: 10, message: '长度在10个字符以内', trigger: 'blur' }],
  password: [{ required: true, trigger: 'blur', validator: validatePassword }],
  userRole: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
})

const remoteLoading = ref(false)
const roleOptions = ref([])

const remoteMethod = async (queryString) => {
  remoteLoading.value = true
  const res = await getRoleListApi({
    roleName: queryString,
    roleState: '1',
    page: 1,
    pageSize: 5
  })
  remoteLoading.value = false
  roleOptions.value = res.data
}

</script>
<template>
  <el-dialog :model-value="visible" :title="title" width="500" :before-close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="账号名称" prop="userName">
        <el-input v-model="formData.userName" placeholder="请输入账号名称" maxlength="10" show-word-limit autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item  v-show="!props.row.user_id" label="密码" prop="password">
        <el-input v-model="formData.password" placeholder="请输入6-15位英文或数字"></el-input>
        <div @click="setDefaultPass" class="default-pass">默认密码</div>
      </el-form-item>
      <el-form-item label="角色" prop="userRole">
        <el-select v-model="formData.userRole" :remote-method="remoteMethod" :loading="remoteLoading"
          placeholder="请输入角色" filterable remote reserve-keyword remote-show-suffix :disabled="!userStore.permission('accountRole')">
          <el-option v-for="item in roleOptions" :label="item.role_name" :value="item.role_name" :key="item.role_id"/>
        </el-select>
      </el-form-item>
      <el-form-item label="组别" prop="group_info">
        <el-input v-model="formData.group_info" placeholder="请输入组别"></el-input>
      </el-form-item>
      <el-form-item label="组长" prop="is_grouper">
        <el-radio-group v-model="formData.is_grouper">
          <el-radio :value="1">是</el-radio>
          <el-radio :value="0">否</el-radio>
        </el-radio-group>
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
.default-pass {
  position: absolute;
  right: 10px;
  font-size: 12px;
  line-height: 12px;
  height: 12px;
  color: #1999FC;
  cursor: pointer;
}
</style>
