<script setup>
import { ref } from 'vue'
import { loadFile, calculateScaledSize } from '../utils'
import { useTimelineStore } from '../stores/timeline'
import { AudioClip, ImgClip, MP4Clip, VisibleSprite, renderTxt2ImgBitmap } from '@webav/av-cliper';

const timelineStore = useTimelineStore()
const actvType = ref(1)
const changeType = (newType) => {
  actvType.value = newType
}
const uploadVideo = async () => {
  const file = await loadFile({ 'video/*': ['.mp4', '.mov'] })
  const stream = file.stream()
  const clip = new MP4Clip(stream);
  const videoMeta = await clip.ready
  const { w, h, x, y } = calculateScaledSize(videoMeta)
  const spr = new VisibleSprite(clip);
  spr.zIndex = 10
  spr.rect.x=x
  spr.rect.y=y
  spr.rect.w=w
  spr.rect.h=h
  await avCvs.addSprite(spr);
  timelineStore.addItem({ type: 1, spr, fileName: file.name })
}

const uploadAudio = async () => {
  const file = await loadFile({ 'audio/*': ['.mp3', '.wav'] })
  const stream = file.stream()
  const clip = new AudioClip(stream);
  const spr = new VisibleSprite(clip);
  spr.zIndex = 20
  await avCvs?.addSprite(spr);
  timelineStore.addItem({ type: 2, spr, fileName: file.name })
}

const uploadText = async () => {
  const text = '示例文字'
  const options = {
     font: {
       name: 'sakura', // 白舟樱花
       url: '/sakura.ttf',
     },
   }
  const bitmap = await renderTxt2ImgBitmap(text, 'font-size: 80px; color: red; font-family: sakura;', options);
  const clip = new ImgClip(bitmap)
  const spr = new VisibleSprite(clip)
  spr.zIndex = 40
  spr.time.duration = 3 * 1e6
  await avCvs?.addSprite(spr);
  timelineStore.addItem({ type: 3, spr, fileName: text })
}

const uploadPic = async () => {
  const file = await loadFile({ 'image/*': ['.jpg', '.jpeg', '.png'] })
  const stream = file.stream()
  const clip = new ImgClip(stream)
  const picMeta = await clip.ready
  const { w, h, x, y } = calculateScaledSize(picMeta)
  const spr = new VisibleSprite(clip)
  spr.zIndex = 30
  spr.rect.x=x
  spr.rect.y=y
  spr.rect.w=w
  spr.rect.h=h
  spr.time.duration = 3 * 1e6
  await avCvs?.addSprite(spr);
  timelineStore.addItem({ type: 4, spr, fileName: file.name })
}


</script>
<template>
  <div class="left-menu">
    <div class="total-type">
      <div :class="`total-type-item video ac${actvType}`" @click="changeType(1)">
        视频
      </div>
      <div :class="`total-type-item audio ac${actvType}`" @click="changeType(2)">
        音频
      </div>
      <div :class="`total-type-item text ac${actvType}`" @click="changeType(3)">
        文字
      </div>
      <div :class="`total-type-item pic ac${actvType}`" @click="changeType(4)">
        图片
      </div>
    </div>
    <div class="detail-type-panel">
      <button v-if="actvType === 1" class="upload-btn" @click="uploadVideo">上传视频</button>
      <button v-if="actvType === 2" class="upload-btn" @click="uploadAudio">上传音频</button>
      <button v-if="actvType === 3" class="upload-btn" @click="uploadText">上传文字</button>
      <button v-if="actvType === 4" class="upload-btn" @click="uploadPic">上传图片</button>
    </div>
  </div>
</template>
<style lang="scss">
.left-menu{
  background-color: #fff;
  flex: 0 0 400px; // 受timeline宽度影响
  box-shadow: 0px 2px 4px 0px #ECEBEA;
  display: flex;
  .total-type{
    width: 80px;
    border-right: 1px solid #000;
    .total-type-item{
      height: 80px;
      line-height: 80px;
      text-align: center;
      color: #aaa;
      cursor: pointer;
      &:hover,&.video.ac1,&.audio.ac2,&.text.ac3,&.pic.ac4{
        color: rgb(228, 228, 231);
      }
    }
  }
  .detail-type-panel{
    flex: 1;
    padding: 10px;
    .upload-btn{
      width: 100%;
      padding: 10px;
      background-color: rgb(228, 228, 231);
      border: 1px solid rgb(228, 228, 231);
      border-radius: 4px;
    }
  }
}
</style>
