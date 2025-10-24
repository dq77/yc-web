<script setup>
import { ref, onMounted, onUnmounted, defineProps } from 'vue'
import { useTimelineStore } from '../stores/timeline'
import { throttle } from '../utils'

const props = defineProps(['item'])

const timelineStore = useTimelineStore()
const item = props.item

let startX = 0
let oldOffset = 0 // 改动前的offset
let oldDuration = 0 // 改动前的duration
let sourceDuration = 0 // 素材原始duration 不能改
let isMoveing = false
let isChangeing = false

// 开始左右拖动移动素材
const startMove = (event) => {
  isMoveing = true;
  startX = event.clientX;
  oldOffset = item.spr.time.offset / 1e6 * timelineStore.scale
  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}

// 开始改变素材长度
const startChange = (event) => {
  isChangeing = true;
  startX = event.clientX;
  sourceDuration = sourceDuration || item.spr.time.duration
  oldDuration = item.spr.time.duration / 1e6 * timelineStore.scale
  document.addEventListener('mousemove', change)
  document.addEventListener('mouseup', up)
}


// 移动素材中
const move = throttle((event) => {
  if (!isMoveing) return;
  let newOffset = oldOffset + event.clientX - startX
  if (newOffset < 0) {
    newOffset = 0
  }
  // // 以下为吸附功能 打开注释即用
  // const pointStart = timelineStore.pointTime * timelineStore.scale / 1e6
  // if (Math.abs(newOffset - pointStart) < 20) { // 头部吸附
  //   newOffset = pointStart
  // }
  // const itemLong = item.spr.time.duration * timelineStore.scale / 1e6

  // if (Math.abs(newOffset + itemLong - pointStart) < 20) { // 尾部吸附
  //   newOffset = pointStart - itemLong
  // }
  item.spr.time.offset = newOffset * 1e6 / timelineStore.scale
}, 16) // 约60fps的频率


// 改变素材长度中
const change = throttle((event) => {
  if (!isChangeing) return;
  let newDuration = oldDuration + event.clientX - startX
  if (item.type !== 3 && item.type !== 4) { // 文字图片不限制长度
    newDuration = Math.min(newDuration, sourceDuration / 1e6 * timelineStore.scale)
  }
  newDuration = Math.max(newDuration, 20)
  item.spr.time.duration = newDuration * 1e6 / timelineStore.scale
}, 16) // 约60fps的频率

// 结束事件
const up = (e) => {
  if (isMoveing || isChangeing) {
    isMoveing = false;
    isChangeing = false;
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mousemove', change)
    document.removeEventListener('mouseup', up)
  }
}

// 组件卸载时清理全局事件监听
onUnmounted(() => {
  document.removeEventListener('mousemove', move)
  document.removeEventListener('mousemove', change)
  document.removeEventListener('mouseup', up)
})

const activeItem = () => {
  timelineStore.activeItem = item
}
</script>
<template>
  <div @click.stop="activeItem" :class="{'spr-item': true, 'active': timelineStore.activeItem === item}" @mousedown="startMove" :style="`left:${item.spr.time.offset / 1e6 * timelineStore.scale}px`">
    {{ item.fileName }}
    <div @mousedown.stop="startChange" class="change-lone">|</div>
  </div>
</template>
<style lang="scss">
.spr-item{
  user-select: none;
  position: absolute;
  height: 26px;
  line-height: 26px;
  padding-left: 2px;
  padding-right: 12px;
  background-color: #EAEBF2;
  border: 2px solid #EAEBF2;
  border-radius: 4px;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  &.active{
    border: 2px solid #666;
  }
  .change-lone{
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 12px;
    // background-color: #d5d6e0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    text-align: right;
    cursor: e-resize;
  }
}
</style>
