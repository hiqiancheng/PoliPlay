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

                <!-- 政策列表组件 -->
                <PolicyList v-if="currentComponent === 'list'" :policyList="policyList" @back="switchComponent('home')"
                    @viewDetail="viewDetail" />
            </div>
        </div>
        <div class="copyright-bar">
            © 2025 千诚 & Marco 版权所有<br>
            Driven by Zeabur, Dify, Kimi, 飞书<br>
            #AdventureX-2025 Hangzhou China
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import PolicyDetail from '../components/PolicyDetail.vue';
import PolicyEditor from '../components/PolicyEditor.vue';
import PolicyReport from '../components/PolicyReport.vue';
import PolicyList from '../components/PolicyList.vue';
import axios from 'axios';

// 当前显示的组件
const currentComponent = ref('home');
// 当前政策ID
const currentPolicyId = ref('');
// 报告数据
const reportData = ref(null);
const policyList = ref([]);
const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleString();
};

// 切换组件
const switchComponent = (component) => {
    currentComponent.value = component;
};

// 加载政策列表
const loadPolicyList = async () => {
    try {
        const res = await axios.get('/api/policy/list');
        policyList.value = res.data;
        switchComponent('list');
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

// 查看详情
const viewDetail = (id) => {
    currentPolicyId.value = id;
    switchComponent('detail');
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
    position: fixed;
    left: 46vw;
    right: 4vw;
    top: 8.2vh;
    bottom: 17.5vh;
    overflow: hidden;
}

.components-container {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0 15px;
    box-sizing: border-box;
    overflow: hidden;
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
    backdrop-filter: blur(2px);
    box-shadow: 0 0 10px 0 rgba(126, 50, 88, 0.8);
    color: #ffffff;
    font-size: 16px;
    padding: 90px 88px;
    position: relative;
}

:deep(.el-button span) {
    font-family: serif;
    font-weight: bold;
    font-size: 25px;
    letter-spacing: 3px;
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

:deep(.el-button:nth-child(2)::after) {
    background-image: url('../assets/images/sketch2.webp');
}

.copyright-bar {
    position: absolute;
    left: 64px;
    bottom: 49px;
    color: #fff;
    font-size: 14px;
    opacity: 0.85;
    letter-spacing: 1px;
    z-index: 2;
    line-height: 1.5;
    pointer-events: none;
    user-select: none;
}
</style>