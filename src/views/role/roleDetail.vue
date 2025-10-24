<script setup>
import { ref, onMounted } from 'vue'
import { ElForm, ElFormItem, ElInput, ElMessageBox, ElMessage } from 'element-plus'
import { getRoleListApi, addRole, editRole } from '@/api/role'
import { useRouter, useRoute } from 'vue-router'
import roleMenuDefault from './role.js'

const router = useRouter()
const route = useRoute()

const formRef = ref()
const roleForm = ref({
  role_name: '',
  role_state: '',
  role_menu: [],
  role_id: ''
})

const oldRoleName = ref('')

onMounted(() => {
  roleForm.value.role_menu = roleMenuDefault
  if (route.query.name) {
    getRoleDetail()
  }
})

const getRoleDetail = async () => {
  const resData = await getRoleListApi({
    roleName: route.query.name,
    roleState: '',
    page: 1,
    pageSize: 5
  })
  roleForm.value.role_name = resData.data[0].role_name
  roleForm.value.role_state = resData.data[0].role_state
  roleForm.value.role_id = resData.data[0].role_id
  const menus = resData.data[0].role_menu
  roleForm.value.role_menu = roleMenuDefault.map(item => {
    const menu = menus.find(menu => menu.name === item.name)
    if (menu) {
      item.value = menu.value
      if (item.action) {
        item.action.forEach(action => {
          const actionMenu = menu.action.find(actionMenu => actionMenu.name === action.name)
          if (actionMenu) {
            action.value = actionMenu.value
          }
        })
      }
    }
    return item
  })
  oldRoleName.value = roleForm.value.role_name

}

const rules = {
  role_name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }, { min: 1, max: 10, message: '长度在10个字以内', trigger: 'blur' }],
}

const back = () => {
  router.back()
}

const save = async () => {
  await formRef.value.validate(async isValid => {
    if (!isValid) { return false }
    let requestApi = addRole
    if (roleForm.value.role_id) {
      requestApi = editRole
    }
    const resData = await requestApi({
      oldRoleName: oldRoleName.value === roleForm.value.role_name ? undefined : oldRoleName.value,
      roleName: roleForm.value.role_name,
      role_state: roleForm.value.role_state,
      menu: roleForm.value.role_menu,
      id: roleForm.value.role_id
    })
    if (resData.code !== 0) {
      ElMessage.error(resData.msg)
      return
    }
    ElMessage.success('操作成功')
    back()
  })
}

</script>

<template>
  <div class="role-detail card-shadow">
    <div class="nav-banner">
      <svg class="icon back-role" @click="back" aria-hidden="true">
        <use xlink:href="#icon-back"></use>
      </svg>
      <span>角色详情</span>
    </div>
    <el-form :model="roleForm" :rules="rules" ref="formRef">
      <el-form-item label="角色名称" prop="role_name">
        <el-input v-model="roleForm.role_name" style="width:280px"/>
      </el-form-item>
    </el-form>
    <div class="detail-title">权限信息</div>
    <el-table :data="roleForm.role_menu" style="width: 100%">
      <el-table-column prop="" width="120px" label="" />
      <el-table-column prop="" width="300px" label="页面" >
        <template #default="scope">
          <el-checkbox v-model="scope.row.value" :label="scope.row.label" />
        </template>
      </el-table-column>
      <el-table-column prop="roleState" label="操作">
        <template #default="scope">
          <span v-for="item in scope.row.action">
            <el-checkbox v-model="item.value" :label="item.label" />
          </span>
        </template>
      </el-table-column>
    </el-table>
    <el-button type="default" @click="back">取消</el-button>
    <el-button type="primary" @click="save">保存</el-button>
  </div>
</template>

<style lang="scss">
.role-detail{
  padding: 20px 100px 20px 60px;
  .nav-banner{
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 20px;
    margin-left: -50px;
    height: 20px;
    line-height: 16px;
    .back-role{
      height: 20px;
      line-height: 20px;
      padding: 0 10px;
      cursor: pointer;
    }
  }
  .detail-title{
    font-size: 16px;
    font-weight: 500;
    margin: 10px 0 20px;
  }
  .el-table{
    margin-bottom: 12px;
    .el-checkbox{
      min-width: 80px;
      margin-right: 20px;
    }
  }
}
</style>
