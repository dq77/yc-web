<script setup>
import { ref, onMounted, defineProps, computed } from 'vue'
import sprItem from './sprItem.vue'
import { useTimelineStore } from '../stores/timeline'
import { storeToRefs } from 'pinia'

const props = defineProps({
  type: {
    type: Number,
    default: 1
  }
})
const timelineStore = useTimelineStore()
const allList = storeToRefs(timelineStore).itemList
const itemList = computed(() => allList.value.filter(item => item.type === props.type))

</script>
<template>
  <div class="spr-line">
    <sprItem v-for="item in itemList" :key="item" :item="item" :style="`width:${item.spr.time.duration * timelineStore.scale / 1e6 - 18 }px`"></sprItem>
  </div>
</template>
<style lang="scss">
.spr-line{
  position: relative;
  height: 30px;
  margin: 2px 0;
}
</style>
