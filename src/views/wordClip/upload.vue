<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOssTempPath, asrAnalysis, uploadMediaByPath, queryCopywritingById } from '@/api/wordClip'
import OSS from 'ali-oss';
import { generateUniqueName } from '@/utils'


const router = useRouter()
const OSSClient = ref(null)
onMounted(() => {
  OSSClient.value = new OSS({
    region: 'oss-cn-shanghai',
    accessKeyId: import.meta.env.VITE_OSS_ACCESS_KEY_ID,
    accessKeySecret: import.meta.env.VITE_OSS_ACCESS_KEY_SECRET,
    bucket: 'ai4d-5cxd8ql31a13bv9wkp',
    authorizationV4: true,
    endpoint: 'https://oss-cn-shanghai.aliyuncs.com'
  });
})



const formData = ref({
  id: '',
  mediaName: '',
  mediaLength: 0,
  imagePath: '',
  language: '0'
})

const rules = ref({
  id: [
    { required: true, message: '请上传视频', trigger: 'blur' }
  ],
  language: [
    { required: true, message: '请选择语言', trigger: 'blur' }
  ]
})

const formRef = ref(null)

const beforeUpload = (file) => {
  const isLt1gb = file.size / 1024 / 1024 / 1024 < 1
  if (!isLt1gb) {
    ElMessage.error('视频大小不能超过1GB')
    return false
  }
  loading.value = true
  percentage.value = 0
  formData.value.id = ''
  formData.value.mediaName = ''
  formData.value.mediaLength = 0
  startUpload(file)
  return false
}

const percentage = ref(0)

const startUpload = async (file) => {
  const uniqueName = generateUniqueName(file.name)
  const progress = (p, _checkpoint) => {
    percentage.value = Math.round(p * 100)
  };
  try {
    const result = await OSSClient.value.multipartUpload(`user_upload/${uniqueName}`, file, { progress })
    const res = await uploadMediaByPath({
      filePath: result.name,
      mediaName: file.name
    })
    if (res.code === '00000') {
      percentage.value = 100
      await handleSuccess(res)
      formData.value.mediaName = file.name
    } else {
      ElMessage.error(res.msg)
    }
    loading.value = false
  } catch (e) {
    if (e.code === 'ConnectionTimeoutError') {
      console.log('TimeoutError');
    }
    loading.value = false
    console.log(e);
  }
}

const loading = ref(false)


const handleSuccess = async (res) => {
  formData.value.id = res.result.id
  formData.value.mediaLength = res.result.mediaLength
  ElMessage.success('上传成功')
  const imagePath = await getOssTempPath({ filePath: res.result.imagePath })
  if (imagePath.code === '00000') {
    formData.value.imagePath = imagePath.result
  } else {
    ElMessage.error(imagePath.msg)
  }
}

const decoding = ref(false)

const asr = async () => {
  if (!formData.value.mediaName) {
    ElMessage.error('请上传视频')
    return
  }
  formRef.value.validate(async (valid) => {
    if (valid) {
      decoding.value = true
      const res = await asrAnalysis({
        id: formData.value.id,
        language: formData.value.language
      })
      if (res.code === '00000') {
        const loop = setInterval(async () => {
          const res = await queryCopywritingById({ mediaId: formData.value.id })
          decoding.value = (res.code === '10001')
          if (res.code !== '10001') {
            clearInterval(loop)
            if (res.code === '00000') {
              await router.push({
                name: 'textEdit',
                query: {
                  id: formData.value.id
                },
              })
              // router.go(0)
              // proxy.$forceUpdate()
            } else {
              ElMessage.error(res.msg)
            }
          }
        }, 3000)
      } else {
        ElMessage.error(res.msg)
        decoding.value = false
      }
    }
  })
}

const removeMedia = () => {
  formData.value.mediaName = ''
  formData.value.id = ''
  formData.value.mediaLength = ''
  formData.value.imagePath = ''
}



</script>

<template>
  <div class="word-clip-index card-shadow">
    <div class="title">
      <div class="main-title">
        <svg class="icon xing" @click="back" aria-hidden="true">
          <use xlink:href="#icon-xing"></use>
        </svg>
        划词剪辑
      </div>
      <div class="sub-title">划词即剪，所见即所得</div>
    </div>
    <div class="df">
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="上传视频" prop="id">
          <el-upload
            :class="['upload-video', {'is-uploaded': !loading && formData.mediaLength}]"
            drag
            action="/lkapi/media/uploadMedia"
            :on-success="handleSuccess"
            :before-upload="beforeUpload"
            accept="video/avi,video/wmv,video/mov,video/mp4"
            :show-file-list="false"
            :disabled="loading || decoding"
          >
            <div v-if="formData.mediaLength" style="position: relative;">
              <img :src="formData.imagePath" style="display: block;max-width: 240px;">
              <img v-if="!decoding" @click.stop="removeMedia" src="@/assets/close.png" width="20px" style="position: absolute;top: 5px;right: 5px;"/>
            </div>
            <div v-else-if="loading" class="progress">
              <el-progress :percentage="percentage" />
            </div>
            <div v-else>
              <img src="@/assets/upload.png" width="32px" style="margin-top: 32px;">
              <div style="color: #333;">点击或拖拽上传本地视频</div>
              <div class="el-upload__text" style="color: #999">
                支持avi、wmv、mov、mp4格式，视频大小不超过1GB，分辨率不超过1080P，时长不超过30分钟
              </div>
            </div>
          </el-upload>
        </el-form-item>
        <div v-if="formData.mediaLength && !loading" style="margin: -10px 0 20px 100px;font-size: 14px;line-height: 20px;">
          {{formData.mediaName}}<br><span style="color: #666;">{{ formData.mediaLength }}</span>
        </div>
        <el-form-item label="语言" prop="language">
          <el-select v-model="formData.language" placeholder="请选择" style="width: 240px" :disabled="decoding">
            <el-option label="中文" value="0" />
            <el-option label="英文" value="1" />
            <el-option label="日文" value="2" />
            <el-option label="韩文" value="3" />
            <el-option label="俄文" value="4" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="submit-btn">
      <el-button type="primary" @click="asr" :loading="decoding" round >开始ASR解析</el-button>
    </div>
  </div>
</template>

<style lang="scss">
.word-clip-index{
  display: flex;
  flex-direction: column;
  .title{
    line-height: 20px;
    padding-bottom: 40px;
    .main-title{
      font-size: 16px;
      font-weight: bold;
      color: #111;
      margin-bottom: 8px;
    }
    .sub-title{
      font-size: 14px;
      color: #666;
    }
  }
  .df{
    flex: 1;
    padding-left: 100px;
    .upload-video{
      .el-upload-dragger{
        background: linear-gradient( 66deg, #FAF8FF 0%, #F8FBFE 100%);
        padding: 0;
        width: 680px;
        height: 150px;
      }
      &.is-uploaded{
        .el-upload-dragger{
          width: auto;
          height: auto;
        }
      }
      .progress{
        margin: 70px 20px;
      }
    }
    .right-area{
      width: 700px;
    }
  }
  .submit-btn{
    margin-top: 40px;
    text-align: center;
    margin-bottom: 12px;
    .el-button{
      width: 114px;
      height: 36px;
      line-height: 36px;
      background: linear-gradient( 270deg, #975AFF 0%, #5184FF 100%);
    }
  }


}
</style>
