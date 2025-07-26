import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import App from './App.vue';
import router from './router';

// 创建Vue应用
const app = createApp(App);

// 使用插件
app.use(createPinia());
app.use(router);
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default'
});

// 挂载应用
app.mount('#app'); 