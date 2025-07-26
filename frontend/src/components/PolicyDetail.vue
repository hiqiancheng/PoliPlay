<template>
    <div class="policy-detail-container">
        <header class="detail-header">
            <h2>政策详情</h2>
            <div class="header-actions">
                <el-button type="primary" plain @click="goBack">返回</el-button>
            </div>
        </header>

        <main class="detail-content" v-if="policy">
            <div class="policy-title">
                <h1>{{ policy.title }}</h1>
                <div class="policy-meta">
                    <span>提交时间: {{ formatDate(policy.createdAt) }}</span>
                </div>
            </div>

            <el-divider />

            <div class="policy-content">
                <h3>政策内容</h3>
                <div class="content-display" v-html="policy.content"></div>
            </div>

            <div class="policy-background">
                <h3>政策背景</h3>
                <el-descriptions :column="1" border>
                    <el-descriptions-item v-for="(item, index) in policy.background" :key="index"
                        :label="item.question">
                        {{ item.answer }}
                    </el-descriptions-item>
                </el-descriptions>
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
    overflow-y: auto;
    background-color: #fff;
    color: #333;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
}

.policy-title {
    text-align: center;
    margin-bottom: 30px;
}

.policy-title h1 {
    margin-bottom: 10px;
    color: #303133;
}

.policy-meta {
    color: #909399;
    font-size: 14px;
}

.policy-content {
    margin-bottom: 30px;
}

.content-display {
    background-color: #f5f7fa;
    border-radius: 4px;
    padding: 20px;
    line-height: 1.8;
}

.policy-background {
    margin-bottom: 30px;
}

:deep(.el-descriptions) {
    --el-descriptions-item-bordered-label-background: #f5f7fa;
    --el-descriptions-item-label-text-color: #606266;
    --el-descriptions-item-bordered-content-background: #ffffff;
    --el-descriptions-item-text-color: #303133;
    --el-border-color: #dcdfe6;
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
    color: #409EFF;
}

:deep(.el-divider) {
    background-color: #dcdfe6;
}
</style>