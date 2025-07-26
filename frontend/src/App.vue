<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup>
// 根组件逻辑
</script>

<style>
.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 全局修改Element Plus组件的焦点边框颜色 */
:root {
  --el-color-primary: #d896c4 !important;
  --el-color-primary-light-3: rgba(216, 150, 196, 0.8) !important;
  --el-color-primary-light-5: rgba(216, 150, 196, 0.6) !important;
  --el-color-primary-light-7: rgba(216, 150, 196, 0.4) !important;
  --el-color-primary-light-8: rgba(216, 150, 196, 0.3) !important;
  --el-color-primary-light-9: rgba(216, 150, 196, 0.2) !important;
  --el-color-primary-dark-2: #b5689d !important;
}

.el-input__wrapper.is-focus,
.el-textarea__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
}

.el-input__wrapper:hover,
.el-textarea__wrapper:hover {
  box-shadow: 0 0 0 1px var(--el-color-primary-light-3) inset !important;
}

/* 全局滚动条美化 */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(149, 64, 107, 0.5);
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(149, 64, 107, 0.15);
  transition: background 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(149, 64, 107, 0.8);
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

/* 火狐浏览器 */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(149, 64, 107, 0.7) rgba(255, 255, 255, 0.08);
}
</style>