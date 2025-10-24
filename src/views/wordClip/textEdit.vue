<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { queryMediaById, queryCopywritingById, splitMedia, querySplitMedia, getOssTempPath } from '@/api/wordClip'
import { addMedia } from '@/api/history'
import { formatDurationWithMs } from '@/utils'
import OSS from 'ali-oss';
import { useUserStore } from '@/stores/user'


const userStore = useUserStore()
// 将文本按行分割
const lines = ref([])
const router = useRouter()


const isEdit = ref(false)
const selectLine = ref()
const startEdit = (e, rowIndex) => {
  selectLine.value = lines.value[rowIndex]
  isEdit.value = true
  document.addEventListener('mouseup', endEdit)
}

const leaveArea = () => {
  // endEdit()
}

const endEdit = () => {
  document.removeEventListener('mouseup', endEdit)
  const line = selectLine.value
  isEdit.value = false
  const selection = window.getSelection();
  if (selection.toString().trim() === '') return;
  // 获取选中的token范围
  const range = selection.getRangeAt(0);
  console.log(range)
  let startSpan = range.startContainer.parentElement
  let endSpan = range.endContainer.parentElement
  // 特殊边界值处理
  if (range.startOffset === 1) {
    const truekey = range.startContainer.parentElement.dataset.index - 0 + 1
    startSpan = range.startContainer.parentElement.parentElement.querySelector(`[data-index="${truekey}"]`);
  }
  // 特殊边界值处理
  if (range.endOffset === 0) {
    const truekey = Math.max(range.endContainer.dataset.index - 1, 0)
    endSpan = range.endContainer.parentElement.querySelector(`[data-index="${truekey}"]`);
  }
  console.log(startSpan, endSpan)
  let startIndex = startSpan.dataset.index - 0
  let endIndex = endSpan.dataset.index - 0
  let startRow = startSpan.dataset.rowkey - 0
  let endRow = endSpan.dataset.rowkey - 0
  // 如果是多行则特殊处理
  if (startRow !== endRow) {
    addMulti(startSpan, endSpan)
  } else {
    changeItemisActive(startRow, startIndex, endIndex)
  }
  selection.removeAllRanges()
}


const addMulti = (startSpan, endSpan) => {
  let startRow = startSpan.dataset.rowkey - 0
  let endRow = endSpan.dataset.rowkey - 0
  let startIndex = startSpan.dataset.index - 0
  let endIndex = endSpan.dataset.index - 0
  lines.value.forEach((item, rowIndex) => {
    if (rowIndex > startRow && rowIndex < endRow) {
      changeItemisActive(rowIndex, 0, item.words.length - 1)
    } else if (rowIndex === startRow) {
      changeItemisActive(rowIndex, startIndex, item.words.length - 1)
    } else if (rowIndex === endRow) {
      changeItemisActive(rowIndex, 0, endIndex)
    }
  })
}

const changeItemisActive = (rowIndex, startIndex, endIndex) => {
  const line = lines.value[rowIndex]
  line.words.forEach((item, index) => {
    if (index >= startIndex && index <= endIndex) {
      // 被单字选中会触发chrome的BUG 单字状态锁死无法更新 先取消选中状态后延迟更新单字状态即可
      setTimeout(() => {
        line.words[index].isActive = !item.isActive
      }, 10)
    }
  })
}

const cliping = ref(false)

const startClip = async () => {
  const id = router.currentRoute.value.query.id
  const finalList = []
  let start = 0
  let end = 0
  let word = ''
  let adding = false
  lines.value.forEach(line => {
    line.words.forEach(char => {
      if (adding) {
        if (char.isActive) {
          end = char.end
          word += char.word
        } else {
          adding = false
          finalList.push({ start: formatDurationWithMs(start), end: formatDurationWithMs(end), text: word })
          word = ''
        }
      } else {
        if (char.isActive) {
          start = char.start
          end = char.end
          word = char.word
          adding = true
        }
      }
    })
  })
  if (adding) {
    adding = false
    finalList.push({ start: formatDurationWithMs(start), end: formatDurationWithMs(end), text: word })
    word = ''
  }
  if (!finalList.length) {
    return ElMessage.error('未选中任何文案')
  }

  cliping.value = true
  const res = await splitMedia({
    id,
    content: finalList
  })
  if (res.code === '00000') {
    const loop = setInterval(async () => {
      const res = await querySplitMedia({ id })
      cliping.value = (res.code === '10001')
      if (res.code !== '10001') {
        clearInterval(loop)
        if (res.code === '00000') {
          const mediaList = res.data[0].msg.map(item => {
            return {
              mediaName: item.title,
              imagePath: item.coverImg,
              mediaPath: item.videoURL,
              appName: 'hccj',
              userId: userStore.userInfo.user_id
            }
          })
          addMedia({ mediaList })
          await router.push({
            path: '/work/wordClip/clipResult',
            query: {
              id,
            }
          })
        } else {
          ElMessage.error(res.msg)
        }
      }
    }, 3000)
  } else {
    ElMessage.error(res.msg)
    cliping.value = false
  }

}

const getMediaInfo = async (id) => {
  const res = await queryMediaById({ id })
  if (res.code === '00000') {
    mediaPath.value = res.result.mediaPath
    const pathRes = await getOssTempPath({ filePath: res.result.mediaPath })
    if (pathRes.code === '00000') {
      mediaPath.value = pathRes.result
    } else {
      ElMessage.error(pathRes.msg)
    }
  }
}

const getWordInfo = async (id) => {
  const res = await queryCopywritingById({ mediaId: id })
  if (res.code === '00000') {
    const mediaInfo = res.data[0]
    mediaInfo.msg.forEach(item => {
      lines.value.push({ ...item,
        words: item.words.map(word => {
          return { ...word, isActive: false }
        })
      })
    })
  } else {
    ElMessage.error(res.msg)
  }
}

const mediaPath = ref('')

onMounted(async () => {
  const id = router.currentRoute.value.query.id
  if (!id) {
    ElMessage.error('参数错误')
    return
  }
  getMediaInfo(id)
  getWordInfo(id)
})

const back = () => {
  router.back()
}

</script>

<template>
  <div class="text-edit">
    <div class="word-editor">
      <div class="title">文案划词<span>点击选中标记文案</span></div>
      <div class="edit-box">
        <el-scrollbar height="100%">
          <div v-for="(line, rowIndex) in lines" @mousedown="e => startEdit(e, rowIndex)" @mouseleave="leaveArea" :key="rowIndex" class="edit-line">
            <div class="line-time">{{ line.startTime }} ~ {{ line.endTime }}</div>

            <div class="word-area" :data-rowkey="rowIndex">
              <span 
                v-for="(char, colIndex) in line.words" 
                :key="`${rowIndex}-${colIndex}`" 
                :data-rowkey="`${rowIndex}`"
                :class="['edit-item', {'isActive': char.isActive}]"
                :data-index="`${colIndex}`"
              >
                {{ char.word }}
              </span>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <div class="submit-btn">
        <el-button type="primary" @click="startClip" :loading="cliping">AI裁剪</el-button>
      </div>
    </div>
    <div class="player">
      <div class="box">
        <video v-if="mediaPath" :src="mediaPath" class="video-box" controls></video>
      </div>
    </div>
    <div class="back-btn">
      <el-button @click="back">上一步</el-button>
    </div>
  </div>
</template>

<style lang="scss">
.text-edit{
  height: 100%;
  background: transparent;
  padding: 0;
  display: flex;
  .word-editor{
    background-color: #fff;
    width: 400px;
    display: flex;
    flex-direction: column;
    box-shadow: 0px 2px 4px 0px #ECEBEA;
    border-radius: 8px;
    padding: 16px;
    height: calc(100% - 32px);
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
      height: calc(100% - 35px - 32px - 16px);
      border: 1px solid #E1E1E1;
      font-size: 14px;
      line-height: 24px;
      .el-scrollbar{
        .el-scrollbar__view{
          padding: 15px;
          .edit-line {
            padding-bottom: 10px;
            .line-time{
              user-select: none;
              line-height: 14px;
              height: 14px;
            }
            .word-area{
              display: flex;
              flex-wrap: wrap;
              padding: 5px 0;
              .edit-item{
                color: #888;
                &.isActive{
                  color: #111;
                  background: #E4E0FB;
                }
              }
            }
          }
        }
      }
    }
    .submit-btn{
      text-align: right;
      margin-top: 16px;
    }

  }
  .player{
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    .box{
      width: 80%;
      height: 90%;
      max-width: 700px;
      max-height: 700px;
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
  .back-btn{
    position: absolute;
    top: 76px;
    right: 16px;
    .el-button{
      width: 80px;
      box-shadow: 0px 2px 10px 0px rgba(204,204,204,0.5);
    }
  }
}
</style>
