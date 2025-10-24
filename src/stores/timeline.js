import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTimelineStore = defineStore('timelineStore', () => {
  const itemList = ref([])
  const scale = ref(20) // 20px=1秒
  const pointTime = ref(0) // 当前时间
  const isPlay = ref(false)
  const activeItem = ref(null)

  const maxTime = computed(() => {
    let max = 0
    itemList.value.forEach(item => {
      if (item.end > max) { max = item.end }
    })
    return max
  })

  const importantPoint = computed(() => {
    let point = []
    itemList.value.forEach(item => {
      const start = item.spr.time.offset
      const end = item.spr.time.offset + item.spr.time.duration
      if (point.indexOf(start) === -1) { point.push(start) }
      if (point.indexOf(end) === -1) { point.push(end) }
    })
    return point
  })



  function addItem(item) {
    itemList.value.push(item)
  }
  // 手动触发播放暂停
  const changePlay = (param) => {
    if (isPlay.value) {
      avCvs.pause()
    } else {
      avCvs.play({start: pointTime.value})
    }
  }

  return { itemList, maxTime, importantPoint, scale, pointTime, addItem, isPlay, changePlay, activeItem }
})
