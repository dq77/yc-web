<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTimelineStore } from '../stores/timeline'
import lineArea from './lineArea.vue'
import sprLine from './sprLine.vue'

const fixedTime = ref()
const timelineStore = useTimelineStore()
const { itemList } = storeToRefs(timelineStore)

onMounted(() => {
})

</script>
<template>
  <div class="time-line" ref="fixedTime">
    <lineArea></lineArea>
    <div class="flx fl1 fdc" @click="timelineStore.activeItem = null" style="justify-content: center;position: relative;">
      <div class="time-now" :style="`left: ${timelineStore.pointTime * timelineStore.scale / 1e6}px`"></div>
      <sprLine v-if="itemList.some(item => item.type === 3)" :type="3"></sprLine> <!-- 文字 -->
      <sprLine v-if="itemList.some(item => item.type === 4)" :type="4"></sprLine> <!-- 图片 -->
      <sprLine v-if="itemList.some(item => item.type === 1)" :type="1"></sprLine> <!-- 视频 -->
      <sprLine v-if="itemList.some(item => item.type === 2)" :type="2"></sprLine> <!-- 音乐 -->
    </div>
  </div>
</template>
<style lang="scss">
.time-line{
  width: calc(100vw - 400px - 30px); // 整体左右布局受此影响 leftMenu占400  paddingLeft占30
  padding-left: 30px;
  height: 220px;
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  overflow: auto;
  overflow-x: scroll;
  padding-bottom: 0px;
  .time-now{
    width: 1px;
    height: 150px;
    background-color: #aaa;
    position: absolute;
    top: 0px;
    left: 0px;
  }
}
</style>
