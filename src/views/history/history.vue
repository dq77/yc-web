<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElForm, ElFormItem, ElInput, ElMessageBox, ElMessage } from 'element-plus'
import { getUserList, deleteUser, editUser } from '@/api/user'
import { getOssTempPath } from '@/api/wordClip'
import { formatTime } from '../../utils'
import { getMediaList, exportMedia, removeMedia } from '@/api/history'
import { useUserStore } from '@/stores/user'


const userStore = useUserStore()
const tab = ref('history')
const changeTab = (val) => {
  if (tab.value !== val) {
    tab.value = val
    getList(val)
  }
}
onMounted(() => {
  getList('history')
  getList('export')
})

const showList = ref([])
const totalInfo = reactive({
  saveNum: 0,
  exportNum: 0
})

const getList = async (type='history') => {
  const params = {
    appName: 'hccj',
    userId: userStore.userInfo.user_id
  }
  if (type === 'history') {
    params.historyMedia = 1
  } else {
    params.exportMedia = 1
  }
  const res = await getMediaList(params)
  if (res.code === 0){
    if (type === tab.value) {
      showList.value = res.data
      showList.value.forEach(item => {
        getOssTempPath({ filePath: item.image_path }).then(res => {
          item.picPath = res.result
        })
      })
    }
    if (type === 'history') {
      totalInfo.saveNum = res.data.length
    } else {
      totalInfo.exportNum = res.data.length
    }
  }
}

const menuSetting = reactive({
  activeItem: null,
  show: false,
  top: 0,
  left: 0,
})


const activeItem = ref()
const showMenu = (e, item) => {
  if (menuSetting.show) {
    menuSetting.show = false
    return
  }
  const hideMenu = () => {
    menuSetting.show = false
    document.removeEventListener('click', hideMenu)
  }
  activeItem.value = item
  menuSetting.show = true
  menuSetting.top = e.clientY - 10
  menuSetting.left = e.clientX + 24
  document.addEventListener('click', hideMenu)
}

const exportItem = async () => {
  if (!userStore.permission('historyExport')) {
    return ElMessage.error('暂无权限')
  }
  exportMedia({ mediaPathList: [activeItem.value.media_path] })
  const pathRes = await getOssTempPath({ filePath: activeItem.value.media_path })
  if (pathRes.code === '00000') {
    getList('export')
    let elementIF = document.getElementById('download-iframe') || document.createElement("iframe");
    elementIF.id = 'download-iframe'
    elementIF.src = pathRes.result;
    elementIF.style.display = "none";
    document.body.appendChild(elementIF);
  } else {
    ElMessage.error(pathRes.msg)
  }
}

const deleteItem = async () => {
  if (!userStore.permission('historyDelete')) {
    return ElMessage.error('暂无权限')
  }
  const res = await removeMedia({
    mediaPath: activeItem.value.media_path,
    action: tab.value === 'history' ? 'removeSaveMedia' : 'removeExportMedia'
  })
  if (res.code === 0) {
    ElMessage.success('删除成功')
    getList(tab.value)
  } else {
    ElMessage.error(res.msg)
  }
}


const dialogVisible = ref(false)
const videoTempURL = ref('')
const closeDialog = () => {
  dialogVisible.value = false
  videoTempURL.value = ''
}

const playMedia = async (item) => {
  dialogVisible.value = true
  const res = await getOssTempPath({ filePath: item.media_path })
   videoTempURL.value = res.result
}


</script>

<template>
  <div class="history-page">
    <div class="left-menu card-shadow">
      <div class="app-item">
        <svg class="icon" @click="back" aria-hidden="true">
          <use xlink:href="#icon-hccj-active"></use>
        </svg>
        划词裁剪
      </div>
    </div>
    <div class="main-content">
      <div class="top-nav card-shadow">
        <div :class="['nav-item', {'active': tab === 'history'}]" class="nav-item" @click="changeTab('history')">已保存({{ totalInfo.saveNum }})</div>
        <div :class="['nav-item', {'active': tab === 'export'}]" class="nav-item" @click="changeTab('export')">已导出({{ totalInfo.exportNum }})</div>
      </div>
      <div class="main-card card-shadow">
        <div v-for="item in showList" @click="playMedia(item)" :key="item.id" class="card-item">
          <div class="img-box" :style="item.picPath ? `background-image: url(${item.picPath})` : ''">
            <div class="btn-box" @click.stop="e => showMenu(e, item)">...</div>
          </div>
          <div class="title">{{ item.media_name }}</div>
          <div class="time">{{ formatTime(item.media_updated_date) }}</div>
        </div>
        <div class="menu" :style="{top: menuSetting.top + 'px', left: menuSetting.left + 'px'}" v-if="menuSetting.show">
          <div class="menu-item" @click="exportItem">导出</div>
          <div class="menu-item" @click="deleteItem">删除</div>
        </div>
      </div>
      <el-dialog
        width="700px"
        class="play-media-dialog"
        v-model="dialogVisible"
        :before-close="closeDialog"
        :show-close="false"
      >
        <video v-if="videoTempURL" :src="videoTempURL" class="video-box" controls></video>
      </el-dialog>
    </div>
  </div>
</template>

<style lang="scss">
.history-page{
  display: flex;
  width: 100%;
  background-color: #F7F7F7;
  .left-menu{
    flex: 0 0 90px;
    margin-right: 15px;
    .app-item{
      cursor: pointer;
      font-size: 12px;
      height: 32px;
      display: flex;
      align-items: center;
      color: #5B44EC;
      background-color: rgba(241, 240, 253,0.8);
      border-radius: 6px;
    }
    .app-item > .icon {
      margin: 0 8px 0 6px;
    }
  }
  .main-content{
    flex: 1;
    display: flex;
    flex-direction: column;
    .top-nav{
      padding: 0 18px;
      flex: 0 0 50px;
      margin-bottom: 15px;
      display: flex;
      .nav-item{
        cursor: pointer;
        margin: 0 13px;
        font-size: 14px;
        line-height: 42px;
        text-align: center;
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
        &:hover, &.active{
          border-bottom: 4px solid #5B44EC;
        }
        &.active{
          color: #5B44EC;
        }
      }
    }
    .main-card{
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      align-content: flex-start;
      .card-item{
        width: 200px;
        font-size: 14px;
        line-height: 20px;
        .img-box{
          width: 200px;
          height: 138px;
          background-color: #F2F3F5;
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center center;
          border-radius: 8px;
          position: relative;
          .btn-box{
            cursor: pointer;
            letter-spacing: 1px;
            opacity: 0;
            color: #fff;
            text-align: center;
            line-height: 11px;
            border-radius: 4px;
            position: absolute;
            width: 20px;
            height: 20px;
            background: rgba(0,0,0,0.4);
            right: 8px;
            bottom: 8px;
            transition: opacity 0.3s;
          }
        }
        .title{
          margin-top: 6px;
          color: #333;
        }
        .time{
          color: #666;
        }
        &:hover{
          .btn-box{
            opacity: 1;
          }
        }
      }
      .menu{
        position: absolute;
        top: 42px;
        left: 0;
        width: 120px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        .menu-item{
          cursor: pointer;
          font-size: 14px;
          line-height: 32px;
          height: 32px;
          padding-left: 12px;
          &:hover{
            background-color: #F7F7F7;
          }

          color: #333;
        }

      }
    }
    .play-media-dialog{
      background-color: transparent;
      padding: 0;
      box-shadow: none;
      .el-dialog__header{
        padding: 0;
      }
      .el-dialog__body{
        display: flex;
        justify-content: center;
      }
      .video-box{
        margin: 0 auto;
        max-width: 700px;
        max-height: 600px;
      }
    }
  }
}
</style>
