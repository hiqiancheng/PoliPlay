<template>
    <div class="policy-detail-container">
        <header class="detail-header">
            <h2>政策详情</h2>
            <div class="header-actions">
                <el-button @click="goBack">返回</el-button>
            </div>
        </header>

        <main class="detail-content" v-if="policy">
            <div class="policy-title">
                <h1>{{ policy.title }}</h1>
                <div class="policy-meta">
                    <span>提交时间: {{ formatDate(policy.createdAt) }}</span>
                </div>
            </div>


            <div class="policy-content">
                <h3>政策内容</h3>
                <div class="content-display" v-html="policy.content"></div>
            </div>

            <div class="policy-background">
                <h3>政策详情</h3>
                <div class="background-items" v-if="policy.background && policy.background.length > 0">
                    <div v-for="item in policy.background" :key="item.id" class="background-item">
                        <div class="question">{{ item.id }}. {{ item.title }}</div>

                        <!-- 文本类型答案 -->
                        <div v-if="item.type === 'text'" class="answer">{{ item.answer }}</div>

                        <!-- 单选题类型答案 -->
                        <div v-else-if="item.type === 'choice'" class="answer">
                            <el-tag size="small" class="purple-tag">{{ item.answer }}</el-tag>
                        </div>

                        <!-- 多选题类型答案 -->
                        <div v-else-if="item.type === 'multiple'" class="answer">
                            <el-tag v-for="(option, index) in item.answer" :key="index" size="small" class="purple-tag"
                                style="margin-right: 5px; margin-bottom: 5px;">
                                {{ option }}
                            </el-tag>
                        </div>

                        <!-- 判断题类型答案 -->
                        <div v-else-if="item.type === 'boolean'" class="answer">
                            <el-tag size="small" :class="item.answer ? 'purple-tag' : 'purple-tag-negative'">
                                {{ item.answer ? '是' : '否' }}
                            </el-tag>
                        </div>
                    </div>
                </div>
                <div v-else class="no-background">
                    <p>暂无详细政策信息。这可能是通过旧版本系统创建的政策。</p>
                </div>
            </div>

            <div class="policy-actions">
                <el-button type="primary" @click="viewReport">查看分析报告</el-button>
            </div>
        </main>

        <div v-else class="loading-container">
            <el-icon class="is-loading">
                <Loading />
            </el-icon>
            <span>正在加载政策详情...</span>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import axios from 'axios';

const props = defineProps({
    policyId: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['back', 'viewReport']);

const policy = ref(null);

// 加载政策详情
onMounted(async () => {
    if (!props.policyId) {
        ElMessage.warning('未找到政策ID');
        emit('back');
        return;
    }

    try {
        const response = await axios.get(`/api/policy/${props.policyId}`);
        policy.value = response.data;
        console.log('加载的政策数据:', policy.value);
        console.log('政策背景数据:', policy.value.background);
    } catch (error) {
        ElMessage.error('加载政策详情失败');
        console.error('加载政策详情失败:', error);
    }
});

// 格式化日期
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 返回上一页
const goBack = () => {
    emit('back');
};

// 查看分析报告
const viewReport = () => {
    emit('viewReport', policy.value.id);
};
</script>

<style scoped>
.policy-detail-container {
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    background-color: transparent;
    color: #fff;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
}

.policy-title {
    text-align: center;
    margin-bottom: 30px;
}

.policy-title h1 {
    margin-bottom: 10px;
    color: #ffffff;
}

.policy-meta {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
}

.policy-content {
    margin-bottom: 30px;
}

.content-display {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 20px;
    line-height: 1.8;
}

.policy-background {
    margin-bottom: 30px;
}

.background-items {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 10px;
}

.background-item {
    padding: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.background-item:last-child {
    border-bottom: none;
}

.question {
    font-weight: bold;
    margin-bottom: 8px;
    color: rgba(255, 255, 255, 0.9);
}

.answer {
    color: #ffffff;
    line-height: 1.6;
}

.no-background {
    padding: 40px 20px;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 2px dashed rgba(255, 255, 255, 0.2);
}

.no-background p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 16px;
    margin: 0;
    line-height: 1.5;
}

:deep(.el-descriptions) {
    --el-descriptions-item-bordered-label-background: rgba(255, 255, 255, 0.1);
    --el-descriptions-item-label-text-color: rgba(255, 255, 255, 0.9);
    --el-descriptions-item-bordered-content-background: rgba(255, 255, 255, 0.05);
    --el-descriptions-item-text-color: rgba(255, 255, 255, 0.8);
    --el-border-color: rgba(255, 255, 255, 0.2);
}

.policy-actions {
    display: flex;
    justify-content: center;
    margin-top: 40px;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
}

.loading-container .el-icon {
    font-size: 40px;
    margin-bottom: 20px;
    color: #ffffff;
}

:deep(.el-divider) {
    background-color: rgba(255, 255, 255, 0.2);
}

.purple-tag {
    background-color: rgba(149, 64, 107, 0.2) !important;
    border-color: rgba(149, 64, 107, 0.4) !important;
    color: #d896c4 !important;
}

.purple-tag-negative {
    background-color: rgba(149, 64, 107, 0.1) !important;
    border-color: rgba(149, 64, 107, 0.3) !important;
    color: #d896c4 !important;
}

:deep(.el-button) {
    background: rgba(149, 64, 107, 0.8);
    border: none;
    box-shadow: 0 0 10px 0 rgba(126, 50, 88, 0.8);
    color: #ffffff;
    font-size: 16px;
    padding: 21px 25px !important;
    position: relative;
}

:deep(.el-button span) {
    font-family: serif;
    font-weight: bold;
    font-size: 17px !important;
    letter-spacing: 2px;
}

:deep(.el-button:hover) {
    background: rgba(149, 64, 107, 0.4);
    transform: scale(1.05);
}

.header-actions :deep(.el-button) {
    padding: 8px 16px;
}

.header-actions :deep(.el-button span) {
    font-size: 16px;
}

.policy-actions :deep(.el-button) {
    padding: 12px 30px;
}

:deep(.el-input) {
    --el-input-bg-color: rgba(255, 255, 255, 0.1);
    --el-input-border-color: rgba(255, 255, 255, 0.2);
    --el-input-text-color: #ffffff;
    --el-input-placeholder-color: rgba(255, 255, 255, 0.6);
    --el-input-focus-border-color: #d896c4;
    --el-input-hover-border-color: rgba(216, 150, 196, 0.8);
}

:deep(.el-textarea) {
    --el-input-bg-color: rgba(255, 255, 255, 0.1);
    --el-input-border-color: rgba(255, 255, 255, 0.2);
    --el-input-text-color: #ffffff;
    --el-input-placeholder-color: rgba(255, 255, 255, 0.6);
    --el-input-focus-border-color: #d896c4;
    --el-input-hover-border-color: rgba(216, 150, 196, 0.8);
}
</style>