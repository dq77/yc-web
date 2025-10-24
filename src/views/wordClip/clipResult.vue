<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { ElMessage } from 'element-plus'
import { querySplitMedia, getOssTempPath } from '@/api/wordClip'
import { saveMedia, exportMedia } from '@/api/history'
import { formatDurationWithMs } from '@/utils'


const router = useRouter()

const videoList = ref([])

const checkList = ref([])
const save = async () => {
  if (!checkList.value.length) {
    return ElMessage.error('请选择视频')
  }
  const res = await saveMedia({ mediaPathList: checkList.value })
  if (res.code === 0) {
    ElMessage.success('保存成功')
  }
}
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const exporting = ref(false)
const exportsMedias = async () => {
  if (!checkList.value.length) {
    return ElMessage.error('请选择视频')
  }
  exporting.value = true
  exportMedia({ mediaPathList: checkList.value })
  for (const item of checkList.value) {
    await sleep(1500);
    const res = await getOssTempPath({ filePath: item })
    let elementIF = document.getElementById('download-iframe') || document.createElement("iframe");
    elementIF.id = 'download-iframe'
    elementIF.src = res.result;
    elementIF.style.display = "none";
    document.body.appendChild(elementIF);
  }
  exporting.value = false
  ElMessage.success('导出成功')
}

const activeMedia = ref(null)

const changeActiveMedia = (item) => {
  activeMedia.value = item
}

const getMediaList = async (id) => {
  const res = await querySplitMedia({ id })
  if (res.code === '00000') {
    videoList.value = res.data[0].msg
    videoList.value.forEach(item => {
      getOssTempPath({ filePath: item.coverImg }).then(res => {
        item.imageTempURL = res.result
      })
      getOssTempPath({ filePath: item.videoURL }).then(res => {
        item.videoTempURL = res.result
      })
    })
  }
}
onMounted(async () => {
  const id = router.currentRoute.value.query.id
  if (!id) {
    ElMessage.error('参数错误')
    return
  }
  getMediaList(id)
})

const goBack = () => {
  router.go(-1)
}

const addItem = (e) => {
  // 留空
  console.log(e)
}

const finishWork = () => {
  router.push({
    name: 'work'
  })
}

</script>

<template>
  <div class="clip-result">
    <div class="word-editor">
      <div class="title">所有视频({{ videoList.length }})</div>
      <div class="edit-box">
        <el-scrollbar height="100%">
          <el-checkbox-group v-model="checkList">
            <div v-for="video in videoList" :key="video.videoURL" @click="changeActiveMedia(video)" class="edit-line">
              <div class="video-pic" :style="`background-image: url(${video.imageTempURL})`">
                <el-checkbox @click.stop="addItem" label="" :value="video.videoURL" />
              </div>
              <div class="video-info">
                <div class="video-name">{{ video.title }}</div>
                <div class="video-length">{{ formatDurationWithMs(video.duration * 1000) }}</div>
              </div>
            </div>
          </el-checkbox-group>
        </el-scrollbar>
      </div>
    </div>
    <div class="main-box">
      <div class="player">
        <div class="box">
          <video v-if="activeMedia" :src="activeMedia.videoTempURL" class="video-box" controls></video>
        </div>
      </div>
      <div v-if="activeMedia" class="srt-card card-shadow">
        <div class="title">视频文案</div>
        <div class="edit-box">
          <el-scrollbar height="100%">
            <div class="edit-line" v-for="item in activeMedia.content">
              <div class="line-time">{{ item.startTime }} ~ {{ item.endTime }}</div>
              <div class="word-area">
                <span class="edit-item">
                  {{ item.text }}
                </span>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
    <div class="opa-btn">
      <el-button @click="goBack">上一步</el-button>
      <el-button @click="save"><img src="../../assets/btn-download.png"/>
        保存
      </el-button>
      <el-button @click="exportsMedias" :loading="exporting"><img src="../../assets/btn-upload.png"/>导出</el-button>
      <el-button @click="finishWork">完成</el-button>
    </div>
  </div>
</template>

<style lang="scss">
.clip-result{
  height: 100%;
  background: transparent;
  padding: 0;
  display: flex;
  .word-editor{
    background-color: #fff;
    width: 368px;
    display: flex;
    flex-direction: column;
    box-shadow: 0px 2px 4px 0px #ECEBEA;
    border-radius: 8px;
    padding: 16px 0 0 16px;
    height: calc(100% - 16px);
    .edit-line{
      padding-right: 16px;
    }
    .title{
      color: #111;
      font-size: 16px;
      line-height: 20px;
      padding-bottom: 14px;
      span{
        font-size: 14px;
        color: #999;
        margin-left: 8px;
      }
    }
    .edit-box{
      height: calc(100% - 32px);
      font-size: 14px;
      line-height: 24px;
      .el-scrollbar{
        .el-scrollbar__view{
          .edit-line {
            .video-pic{
              height: 170px;
              background-color: #F2F3F5;
              background-size: cover;
              background-repeat: no-repeat;
              background-position: center center;
              .el-checkbox{
                padding: 6px 2px 6px 15px;
              }
            }
            .video-info{
              padding: 8px 2px 12px;
              font-size: 14px;
              line-height: 20px;
              .video-name{
                color: #111;
              }
              .video-length{
                color: #666;
              }
            }
          }
        }
      }
    }
  }
  .main-box{
    padding-left: 15px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .player{
      flex: 1;
      .box{
        width: 80%;
        height: 90%;
        max-width: 700px;
        max-height: 600px;
        display: flex;
        justify-content: center;
        align-items: center;
        .video-box {
          max-width: 100%;
          max-height: 100%;
          margin-bottom: 60px;
          object-fit: contain;
          box-shadow: 0px 6px 12px 0px #A8A8A8;
        }
      }
    }
    .srt-card{
      flex: 0 0 165px;
      height: 165px;
      width: calc(100% - 32px);
      .title{
        color: #111;
        font-size: 16px;
        line-height: 20px;
        padding-bottom: 12px;
      }
      .edit-box{
        height: calc(100% - 32px);
        background-color: #F9F9FB;
        font-size: 14px;
        line-height: 24px;
        .el-scrollbar{
          .el-scrollbar__view{
            padding: 15px;
            .edit-line {
              padding-bottom: 10px;
              .word-area{
                display: flex;
                flex-wrap: wrap;
                .edit-item{
                  color: #888;
                }
              }
            }
          }
        }
      }
    }
  }
  .opa-btn{
    position: absolute;
    top: 76px;
    right: 16px;
    .el-button{
      width: 80px;
      margin-left: 4px;
      box-shadow: 0px 2px 10px 0px rgba(204,204,204,0.5);
      img{
        width: 12px;
        height: 12px;
        margin-right: 3px;
      }
    }
  }
}
</style>
