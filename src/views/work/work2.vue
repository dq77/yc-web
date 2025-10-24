<script setup>
import { ref, onMounted } from 'vue'
  import { AVCanvas } from '@webav/av-canvas';
import leftMenu from '../../components/leftMenu.vue'
import contorlPanel from '../../components/contorlPanel.vue'
import playPanel from '../../components/playPanel.vue'
import timeLine from '../../components/timeLine.vue'
import { useTimelineStore } from '../../stores/timeline'
import { setScreenSize } from '../../utils'

window.itemList = []
const timelineStore = useTimelineStore()
onMounted(() => {
  const cvsElem = document.getElementById('screen')
  setScreenSize(cvsElem)
  const avCvs = new AVCanvas(cvsElem, {
    bgColor: '#000',
    width: 720,
    height: 1280,
  });
  avCvs.on('timeupdate', (time) => {
    timelineStore.pointTime = time
  });
  avCvs.on('playing', () => {
    timelineStore.isPlay = true
  });
  avCvs.on('paused', () => {
    timelineStore.isPlay = false
  });
  window.avCvs = avCvs
})

</script>

<template>
  <div class="clip-main-content flx">
    <leftMenu></leftMenu>
    <div class="fl1 flx fdc">
      <div class="fl1 flx" style="border-bottom: 2px solid #E1E1E1;">
        <div id="play-area">
          <div id="screen"></div>
          <playPanel></playPanel>
        </div>
        <contorlPanel></contorlPanel>
      </div>
      <timeLine></timeLine>
    </div>
  </div>
</template>
<style lang="scss">
.flx{
  display: flex;
}
.fl1{
  flex: 1;
}
.fdc{
  flex-direction: column;
}
.clip-main-content{
  height: calc(100% + 30px);
  margin: -15px;
  background-color: #F9F9FA;
  #play-area{
    flex: 1;
    padding-top: 15px;
    #screen{
      margin: 0 auto;
      box-shadow: 0px 6px 12px 0px #A8A8A8;
    }
  }
}
</style>
