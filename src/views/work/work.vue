<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'


const router = useRouter()
const toWordClip = () => {
  router.push({
    path: '/work/wordClip/upload'
  })
}

onMounted(async() => {
  const res = await import('ali-oss');
  console.log(res)
})


</script>

<template>
  <div class="work-page">
    <div class="title">
      <div>
        <img src="../../assets/logo.png" width="264px">
      </div>
      <div class="slogan">让AI为您的商品创造一个购买理由</div>
    </div>
    <div class="item-list">
      <div class="item-card hccj" @click="toWordClip">
        <div class="card-title">
          <img src="../../assets/title-hccj.png" width="24px">划词裁剪
        </div>
        <div class="card-subtitle">
          划词即剪，所见即所得
        </div>
        <div class="card-btn">
          <el-button type="primary" @click="toWordClip" round >开始制作</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.work-page.router-view{
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 3;
  top: 0;
  left: 0;
  padding: 0;
  background: url('@/assets/work.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  .title{
    text-align: center;
    padding-bottom: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .slogan{
      font-weight: bold;
      letter-spacing: 3px;
      background: linear-gradient( 270deg, #975AFF 0%, #5184FF 100%);
      background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-top: 21px;
      line-height: 28px;
      font-size: 26px;
      height: 28px;
    }
  }
  .item-list{
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    .item-card{
      box-sizing: border-box;
      width: 390px;
      height: 180px;
      background: #fff;
      border-radius: 26px;
      padding: 38px 33px 22px;
      margin: 14px;
      font-size: 14px;
      line-height: 20px;
      display: flex;
      flex-direction: column;
      transition: box-shadow 0.3s;
      &.hccj{
        background: url('@/assets/bg-hccj.png');
        background-size: 100% 100%; 
      }

      &:hover{
         box-shadow: 0px 8px 25px 0px rgba(173,168,182,0.3);
         .card-btn{
            opacity: 1;
         }
      }
      .card-title{
        font-size: 20px;
        line-height: 22px;
        font-weight: bold;
        color: #333;
        display: flex;
        img{
          margin-right: 8px;
        }
      }
      .card-subtitle{
        margin-top: 14px;
        color: #666;
        flex: 1;
      }
      .card-btn{
        opacity: 0;
        transition: opacity 0.3s;
        text-align: center;
        line-height: 16px;
        .el-button{
          height: 32px;
          background: linear-gradient( 270deg, #975AFF 0%, #5184FF 100%);
        }
      }


    }
  }
}
</style>
