
<script setup>
import Navbar from './components/navbar.vue'


</script>

<template>
  <div class="app-wrapper">
    <Navbar />
    <div class="layout-main-box">
      <router-view class="router-view" :key="$route.fullPath" />
    </div>
  </div>
</template>
<style lang="scss">
.app-wrapper{
  height: 100%;
}
.layout-main-box{
  padding: 15px;
  height: calc(100vh - 90px);
}
.router-view{
  background-color: #fff;
  min-height: 100%;
  box-sizing: border-box;
}
</style>
