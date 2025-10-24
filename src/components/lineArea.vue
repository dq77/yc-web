<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useTimelineStore } from '../stores/timeline'
import { throttle } from '../utils'
import { storeToRefs } from 'pinia'

const timelineStore = useTimelineStore()
const lineCount = ref(0)
const { scale } = storeToRefs(timelineStore)
const leftPadding = ref(0)


onMounted(() => {
  lineCount.value = 200
  leftPadding.value = lineArea.value.getBoundingClientRect().left
})

watch(scale, (val) => {
  lineCount.value = val * 10
})


const lineArea = ref(null)
let isMouseDown = false

const down = throttle((e) => {
  isMouseDown = true;
  move(e)
  // 添加全局事件监听
  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}, 16)

const move = throttle((e) => {
  if (!isMouseDown) return;
  // 获取父容器的滚动偏移量
  const scrollLeft = lineArea.value.parentElement.scrollLeft || 0;
  // 计算鼠标位置时加上滚动偏移量
  let x = e.clientX - leftPadding.value + scrollLeft;
  if (x < 0) { x = 0 }
  // 以下为吸附功能 打开注释即用
  // let distance = 20 // 计算每个时间点的距离 取最近的一个时间点进行吸附
  // timelineStore.importantPoint.forEach(item => {
  //   const itemX = item * scale.value / 1e6
  //   if (Math.abs(x - itemX) < 20 && Math.abs(x - itemX) < distance) { // 距离小于20 并且小于其他时间点的距离 也就是说这个点是最近的一个时间点
  //     distance = Math.abs(x - itemX)
  //     x = itemX
  //   }
  // })
  let point = x * 1e6 / scale.value
  avCvs.previewFrame(point)
}, 16)

const up = (e) => {
  if (isMouseDown) {
    isMouseDown = false;
    // 移除全局事件监听
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
  }
}

// 组件卸载时清理全局事件监听
onUnmounted(() => {
  document.removeEventListener('mousemove', move)
  document.removeEventListener('mouseup', up)
})

const formatSecond = (num) => {
  const minute = Math.floor(num / 60)
  const secend = Math.floor(num - minute * 60)
  const az = (num, long) => {
    if (num < 10 ** (long - 1)) {
      return `0${num}`
    } else {
      return `${num}`
    }
  }
  return `${az(minute,2)}:${az(secend,2)}`
}

const calcBlankNumber = (item) => {
  const blankList = [320, 160, 80, 40, 20, 10, 5]
  return (item - 1) % blankList.indexOf(timelineStore.scale) === 0 && (Number.isInteger((item - 1) * 20 / timelineStore.scale))
}

</script>
<template>
  <div class="line-area" ref="lineArea" @mousedown="down">
    <div class="handle" :style="`left:${timelineStore.pointTime * timelineStore.scale / 1e6 - 6}px`">
      <div class="fliter"></div>
    </div>
    <div :class="['shortLine', { 'long': calcBlankNumber(item) }]" v-for="item in lineCount" :key="item">
      <div v-if="calcBlankNumber(item)" class="line-num">{{ formatSecond((item - 1) * 20 / timelineStore.scale) }}</div>
    </div>
  </div>
</template>
<style lang="scss">
.line-area{
  flex: 0 0 30px;
  width: 100%;
  height: 30px;
  position: relative;
  display: flex;
  align-items: start;
  .handle{
    position: absolute;
    top: 16px;
    left: 0px;
    width: 13px;
    height: 10px;
    background-color: #aaa;
    .fliter{
      position: absolute;
      width: 1px;
      height: 1px;
      border-top: 4px solid #aaa;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      top: 10px;
      left: 0px;
    }
  }
  .shortLine{
    flex: 0 0 19px;
    width: 19px;
    height: 5px;
    border-left: 1px solid #F9F9FA;
    position: relative;
    user-select: none;
    @media (resolution: 1.25dppx) {
      flex: 0 0 calc(19px * 1.011);
      width: calc(19px * 1.011);
    }
    @media (resolution: 1.5dppx) {
      flex: 0 0 calc(19px * 1.018);
      width: calc(19px * 1.018);
    }
    @media (resolution: 1.75dppx) {
      flex: 0 0 calc(19px * 1.023);
      width: calc(19px * 1.023);
    }
    @media (resolution: 2.25dppx) {
      flex: 0 0 calc(19px * 1.006);
      width: calc(19px * 1.006);
    }
    &.long{
      height: 8px;
      border-left: 1px solid #E1E1E1;
    }
    .line-num{
      width: 150px;
      height: 12px;
      color: #666666;
      line-height: 12px;
      padding: 16px 0 2px;
      text-align: center;
      position: absolute;
      top: 0px;
      left: -75px;
    }
  }
}
</style>
