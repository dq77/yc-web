<script setup>
import { ref, onMounted } from 'vue'
import { ElForm, ElFormItem, ElInput, ElMessageBox, ElMessage } from 'element-plus'
import { getUserList, deleteUser, editUser } from '@/api/user'
import { getRoleListApi } from '@/api/role'
import { formatTime } from '../../utils'
import editDialog from '@/views/account/components/editDialog.vue'
import changePassword from '@/views/account/components/changePassword.vue'
import { useUserStore } from '@/stores/user'

const searchForm = ref({
  userName: '',
  userRole: '',
  account_state: '',
  groupInfo: '',
  is_grouper: ''
})

const editRow = ref({})

const getData = () => {
  currentPage.value = 1
  getAccountList()
}

const editData = (row) => {
  editVisible.value = true
  editRow.value = row
}

const deleteData = (row) => {
  ElMessageBox.confirm('此操作将永久删除该用户, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteUser({
      id: row.user_id
    })
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: '删除成功!'
      })
    }
    getAccountList()

  }).catch(() => {})
}

const resetForm = () => {
  searchForm.value = {
    userName: '',
    userRole: '',
    account_state: '',
    groupInfo: '',
    is_grouper: ''
  }
  getData()
}

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const tableData = ref([])
const userStore = useUserStore()

onMounted(() => {
  getAccountList()
})

const getAccountList = async () => {
  const resData = await getUserList({
    page: currentPage.value,
    pageSize: pageSize.value,
    userName: searchForm.value.userName,
    groupInfo: searchForm.value.groupInfo,
    userRole: searchForm.value.userRole || '',
    account_state: searchForm.value.account_state,
    is_grouper: searchForm.value.is_grouper
  })
  
  tableData.value = resData.data
  total.value = resData.total
}

const changePage = (page) => {
  currentPage.value = page
  getAccountList()
}

const changeSize = (size) => {
  pageSize.value = size
  changePage(1)
}

const editVisible = ref(false)  
const passwordVisible = ref(false)

const resetPassword = (row) => {
  passwordVisible.value = true
  editRow.value = row
}

const changeState = async (row) => {
  ElMessageBox.confirm(`确定${row.account_state === 1 ? '禁用' : '启用'}该账号?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const newState = row.account_state === 1 ? 0 : 1
    const res = await editUser({
      userName: row.user_name,
      group_info: row.group_info,
      roles: row.user_role,
      account_state: newState,
      is_grouper: row.is_grouper,
      user_id: row.user_id
    })
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: '操作成功!'
      })
    }
    getAccountList()
  }).catch(() => {})
}

const remoteLoading = ref(false)
const roleOptions = ref([])

const remoteMethod = async (queryString) => {
  // if (queryString === '') return
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
  <div class="account-page card-shadow">
    <div class="search-box">
      <div class="search-form">
        <el-form ref="form" :model="searchForm" inline>
          <el-form-item label="账号名称">
            <el-input v-model="searchForm.userName" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="角色名称">
            <el-select v-model="searchForm.userRole" :remote-method="remoteMethod" :loading="remoteLoading"
              placeholder="请输入" filterable remote reserve-keyword remote-show-suffix clearable>
              <el-option v-for="item in roleOptions" :label="item.role_name" :value="item.role_name" :key="item.role_id"/>
            </el-select>
          </el-form-item>
          <el-form-item label="账号状态">
            <el-select v-model="searchForm.account_state" placeholder="请选择" clearable>
              <el-option label="正常" value="1"></el-option>
              <el-option label="禁用" value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="组别">
            <el-input v-model="searchForm.groupInfo" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="组长">
            <el-select v-model="searchForm.is_grouper" placeholder="请选择" clearable>
              <el-option label="是" :value="1"></el-option>
              <el-option label="否" :value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="box-btn">
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="getData">筛选</el-button><br>
        <el-button type="primary" class="mt12" @click="editData" v-if="userStore.permission('accountAdd')">添加账号</el-button>
      </div>
    </div>
    <el-table class="mt12" size="large" :data="tableData" stripe style="width: 100%">
      <el-table-column prop="user_name" label="账号名称"/>
      <el-table-column prop="user_role" label="角色">
        <template #default="scope">
          <div>{{ scope.row.user_role }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="account_state" label="账号状态">
        <template #default="scope">
          <el-tag :type="scope.row.account_state === 1 ? 'success' : 'danger'">
            {{ scope.row.account_state === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="group_info" label="组别"/>
      <el-table-column prop="is_grouper" label="组长">
        <template #default="scope">
          <div>{{ scope.row.is_grouper === 1 ? '是' : '否' }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="oprate_user" label="最后操作账号" />
      <el-table-column prop="update_time" label="最后操作时间">
        <template #default="scope">
          <div>{{ formatTime(scope.row.update_time) }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="operate" label="操作" width="260px">
        <template #default="scope">
          <div>
            <el-button text @click="changeState(scope.row)" v-if="userStore.permission('accountEnable')">{{ scope.row.account_state === 1 ? '禁用' : '启用' }}账号</el-button>
            <el-button text @click="resetPassword(scope.row)" v-if="userStore.permission('accountReset')">重置密码</el-button>
            <el-button text @click="editData(scope.row)">编辑</el-button>
            <el-button text @click="deleteData(scope.row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="mt12"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[20, 50, 100, 200]"
      background
      layout="total, sizes, prev, pager, next"
      :total="total"
      @size-change="changeSize"
      @current-change="changePage"
    />
    <edit-dialog v-model:visible="editVisible" @reflash="getAccountList" :row="editRow"></edit-dialog>
    <change-password v-model:visible="passwordVisible" @reflash="getAccountList" :row="editRow"></change-password>
  </div>
</template>

<style lang="scss">
</style>
