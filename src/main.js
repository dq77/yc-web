
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import './styles/element/index.scss'
import './styles/main.css'
import './assets/icon/iconfont.js'

import App from './App.vue'
import router from './router'
import './permission'
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })
app.$message = ElementPlus.ElMessage

app.mount('#app')
