<script setup>
import { ref, onMounted } from 'vue'
import { ElForm, ElFormItem, ElInput, ElMessageBox, ElMessage } from 'element-plus'
import { getRoleListApi, deleteRole, editRole } from '@/api/role'
import { formatTime } from '../../utils'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()

const searchForm = ref({
  roleName: '',
  roleState: '',
})

const userStore = useUserStore()

const getData = () => {
  currentPage.value = 1
  getRoleList()
}

const toDetail = (row) => {
  router.push({
    path: row?.role_name ? '/roleEdit' : '/roleAdd',
    query: {
      name: row?.role_name
    }
  })
}

const deleteData = (row) => {
  ElMessageBox.confirm('此操作将永久删除该角色, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteRole({
      id: row.role_id,
      role_name: row.role_name
    })
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: '删除成功!'
      })
    }
    getRoleList()

  }).catch(() => {})
}

const resetForm = () => {
  searchForm.value = {
    roleName: '',
    roleState: '',
  }
  getData()
}

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const tableData = ref([])

onMounted(() => {
  getRoleList()
})

const getRoleList = async () => {
  const resData = await getRoleListApi({
    page: currentPage.value,
    pageSize: pageSize.value,
    roleName: searchForm.value.roleName,
    roleState: searchForm.value.roleState
  })
  
  tableData.value = resData.data
  total.value = resData.total
}

const changePage = (page) => {
  currentPage.value = page
  getRoleList()
}

const changeSize = (size) => {
  pageSize.value = size
  changePage(1)
}


const changeState = async (row) => {
  ElMessageBox.confirm(`确定${row.role_state === 1 ? '禁用' : '启用'}该角色?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const newState = row.role_state === 1 ? 0 : 1
    const res = await editRole({
      roleName: row.role_name,
      menu: row.role_menu,
      role_state: newState,
      id: row.role_id
    })
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: '操作成功!'
      })
    }
    getRoleList()
  }).catch(() => {})
}

</script>

<template>
  <div class="role-page card-shadow">
    <div class="search-box">
      <div class="search-form">
        <el-form ref="form" :model="searchForm" inline>
          <el-form-item label="角色名称">
            <el-input v-model="searchForm.roleName" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="角色状态">
            <el-select v-model="searchForm.roleState" placeholder="请选择" clearable>
              <el-option label="正常" value="1"></el-option>
              <el-option label="禁用" value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="box-btn">
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="getData">筛选</el-button><br>
        <el-button type="primary" class="mt12" @click="toDetail" v-if="userStore.permission('roleAdd')">添加角色</el-button>
      </div>
    </div>
    <el-table class="mt12" size="large" :data="tableData" stripe style="width: 100%">
      <el-table-column prop="role_name" label="角色名称"/>
      <el-table-column prop="role_state" label="角色状态">
        <template #default="scope">
          <el-tag :type="scope.row.role_state === 1 ? 'success' : 'danger'">
            {{ scope.row.role_state === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="oprate_user" label="最后操作账号" />
      <el-table-column prop="role_updated_date" label="最后操作时间">
        <template #default="scope">
          <div>{{ formatTime(scope.row.role_updated_date) }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="operate" label="操作">
        <template #default="scope">
          <div>
            <el-button text @click="changeState(scope.row)" v-if="userStore.permission('roleEnable')">{{ scope.row.role_state === 1 ? '禁用' : '启用' }}角色</el-button>
            <el-button text @click="toDetail(scope.row)" v-if="userStore.permission('roleEdit')">编辑</el-button>
            <el-button text @click="deleteData(scope.row)" v-if="userStore.permission('roleDelete')">删除</el-button>
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
  </div>
</template>

<style lang="scss">
</style>
