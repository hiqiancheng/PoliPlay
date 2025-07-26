<template>
    <div class="home-container">
        <div alt="背景图片" class="background-image"></div>
        <div class="content-boundary">
            <div class="components-container">
                <!-- 主页内容 -->
                <div v-if="currentComponent === 'home'" class="home-content">
                    <div class="main-content">
                        <div class="action-buttons">
                            <el-button type="primary" @click="switchComponent('editor')">新建政策</el-button>
                            <el-button @click="loadPolicyList">已有政策</el-button>
                        </div>
                    </div>
                </div>

                <!-- 政策详情组件 -->
                <PolicyDetail v-if="currentComponent === 'detail'" :policyId="currentPolicyId"
                    @back="switchComponent('home')" @viewReport="showReport" />

                <!-- 政策编辑组件 -->
                <PolicyEditor v-if="currentComponent === 'editor'" @back="switchComponent('home')"
                    @showReport="showReportFromEditor" />

                <!-- 政策报告组件 -->
                <PolicyReport v-if="currentComponent === 'report'" :reportData="reportData"
                    @back="switchComponent('home')" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import PolicyDetail from '../components/PolicyDetail.vue';
import PolicyEditor from '../components/PolicyEditor.vue';
import PolicyReport from '../components/PolicyReport.vue';

// 当前显示的组件
const currentComponent = ref('home');
// 当前政策ID
const currentPolicyId = ref('');
// 报告数据
const reportData = ref(null);

// 切换组件
const switchComponent = (component) => {
    currentComponent.value = component;
};

// 加载政策列表
const loadPolicyList = async () => {
    try {
        // 这里应该调用API获取政策列表
        // 暂时模拟一个政策ID
        currentPolicyId.value = '123';
        switchComponent('detail');
    } catch (error) {
        ElMessage.error('加载政策列表失败');
        console.error('加载政策列表失败:', error);
    }
};

// 显示报告
const showReport = (policyId) => {
    currentPolicyId.value = policyId;
    switchComponent('report');
};

// 从编辑器显示报告
const showReportFromEditor = (data) => {
    reportData.value = data;
    switchComponent('report');
};
</script>

<style scoped>
body {
    overflow: hidden;
}

.background-image {
    position: absolute;
    background-image: url('../assets/images/background.png');
    top: 0;
    left: 0;
    height: 100vh;
    /*铺满全屏*/
    width: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: -1;
}

.home-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
}

.content-boundary {
    position: absolute;
    left: 46vw;
    right: 4vw;
    top: 6.6vh;
    bottom: 16.4vh;
    overflow: hidden;
}

.components-container {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 16px;
    padding: 0;
    box-sizing: border-box;
    overflow: hidden;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    color: #fff;
}

.home-content {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    width: 100%;
    height: 100%;
}

.action-buttons {
    display: flex;
    gap: 20px;
}

:deep(.el-button) {
    background: rgba(149, 64, 107, 0.8);
    border: none;
    box-shadow: 0 0 10px 0 rgba(126, 50, 88, 0.8);
    color: #ffffff;
    font-size: 16px;
    padding: 85px 88px;
    position: relative;
}

:deep(.el-button) {
    font-family: 'Source Han Serif Heavy';
}

:deep(.el-button:hover) {
    background: rgba(149, 64, 107, 0.4);
    transform: scale(1.15);
}

:deep(.el-button::after) {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    background-image: url('../assets/images/sketch1.webp');
    width: 40%;
    height: 100%;
    background-size: contain;
    background-position: bottom;
    background-repeat: no-repeat;
    z-index: -1;
}
</style>