<script setup>
import { ref, onMounted, toRaw } from 'vue'
import { useTimelineStore } from '../stores/timeline'
import { ImgClip, VisibleSprite } from '@webav/av-cliper';

const timelineStore = useTimelineStore()
const playVideo = () => {
  timelineStore.changePlay()
}
const formatPlayTime = (pointTime) => {
  // 小于10的数补成3位还有bug 再说吧
  const timeLong = pointTime / 1e3
  const minute = Math.floor(timeLong / 60000)
  const secend = Math.floor((timeLong - minute * 60000) / 1000)
  const miniSecond = Math.floor(timeLong - minute * 60000 - secend * 1000)
  const az = (num, long) => {
    if (num < 10 ** (long - 1)) {
      return `0${num}`
    } else {
      return `${num}`
    }
  }
  return `${az(minute,2)}:${az(secend,2)}:${az(miniSecond,3)}`
}

const add = () => {
  const newScale = timelineStore.scale * 2
  if (newScale > 160) return
  timelineStore.scale = newScale
}

const sub = () => {
  const newScale = timelineStore.scale / 2
  if (newScale < 5) return
  timelineStore.scale = newScale
}

const cut = async () => {
  if (timelineStore.isPlay) return
  
  const fileName = timelineStore.activeItem.fileName
  const type = timelineStore.activeItem.type
  const spr = toRaw(timelineStore.activeItem.spr)
  const newClips = await spr.getClip().split?.(timelineStore.pointTime - spr.time.offset);
  const { w, h, x, y } = spr.rect;
  // 移除原有对象
  remove()
  // 添加分割后生成的两个新对象
  const sprsDuration = [
    timelineStore.pointTime - spr.time.offset,
    spr.time.duration - (timelineStore.pointTime - spr.time.offset),
  ];
  const sprsOffset = [ spr.time.offset, spr.time.offset + sprsDuration[0] ];
  for (let i = 0; i < newClips.length; i++) {
    const clip = newClips[i];
    const newSpr = new VisibleSprite(clip);
    if (clip instanceof ImgClip) {
      newSpr.time.duration = sprsDuration[i];
    }
    newSpr.time.offset = sprsOffset[i];
    newSpr.rect.x=x
    newSpr.rect.y=y
    newSpr.rect.w=w
    newSpr.rect.h=h
    await avCvs.addSprite(newSpr);
    timelineStore.addItem({ type, spr: newSpr, fileName })
  }
}

const remove = () => {
  if (timelineStore.isPlay || !timelineStore.activeItem) return
  avCvs?.removeSprite(toRaw(timelineStore.activeItem.spr));
  timelineStore.itemList = timelineStore.itemList.filter(item => item !== timelineStore.activeItem)
  timelineStore.activeItem = null
}
const createFileWriter = async ( extName = 'mp4' ) => {
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: `WebAV-export-${Date.now()}.${extName}`,
  });
  return fileHandle.createWritable();
}

const exportVideo = async () => {

  const fileWriter = await createFileWriter()
  console.log('开始导出')
  const combinator = await avCvs.createCombinator()
  combinator.output().pipeTo(fileWriter)
  console.log('导出完成')
}

</script>
<template>
  <div class="play-panel">
    <div class="left-area">{{ formatPlayTime(timelineStore.pointTime) }}
      
      <span @click="cut">割</span>&nbsp;
      <span @click="remove">删</span>
    </div>
    <div class="mid-area">
      <div class="btn" @click="playVideo">{{ timelineStore.isPlay ? '暂停' : '播放' }}</div>
    </div>
    <div class="right-area">
      <span @click="add">加</span>&nbsp;
      <span @click="sub">减</span>&nbsp;
      <span @click="exportVideo">导出</span>
    </div>
  </div>
</template>
<style lang="scss">
.play-panel{
  height: 40px;
  display: flex;
  justify-content: space-between;
  .left-area, .right-area{
    flex: 1 1 200px;
  }
  .mid-area{
    flex: 1 1 200px;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
}
</style>
