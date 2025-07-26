<template>
    <div class="report-container">
        <header class="report-header">
            <h2>政策分析报告</h2>
            <div class="header-actions">
                <button class="gradient-button secondary-button" @click="goBack">返回</button>
                <button class="gradient-button primary-button" @click="exportToFeishu">导出到飞书</button>
            </div>
        </header>

        <main class="report-content" v-if="report">
            <div class="report-title">
                <h1>{{ report.title }}</h1>
                <div class="report-meta">
                    <span>生成时间: {{ formatDate(report.generatedAt) }}</span>
                </div>
            </div>

            <el-divider />

            <div class="report-summary">
                <h3>政策总结</h3>
                <p>{{ report.summary }}</p>
            </div>

            <div class="report-metrics">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-card class="metric-card">
                            <template #header>
                                <div class="card-header">
                                    <span>支持度</span>
                                </div>
                            </template>
                            <div class="metric-value">
                                <el-progress type="dashboard" :percentage="report.supportRate"
                                    :color="getColorForRate(report.supportRate)" />
                                <div class="metric-label">{{ getSupportLabel(report.supportRate) }}</div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="12">
                        <el-card class="metric-card">
                            <template #header>
                                <div class="card-header">
                                    <span>反对度</span>
                                </div>
                            </template>
                            <div class="metric-value">
                                <el-progress type="dashboard" :percentage="report.opposeRate"
                                    :color="getColorForRate(report.opposeRate)" />
                                <div class="metric-label">{{ getOpposeLabel(report.opposeRate) }}</div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <div class="report-tags">
                <h3>政策标签</h3>
                <div class="tags-container">
                    <el-tag v-for="(tag, index) in report.tags" :key="index" :type="getTagType(index)" class="tag-item">
                        {{ tag }}
                    </el-tag>
                </div>
            </div>

            <div class="report-wordcloud">
                <h3>词云分析</h3>
                <div class="wordcloud-container">
                    <!-- 这里可以接入词云组件，暂时使用标签模拟 -->
                    <div class="word-tags">
                        <span v-for="(word, index) in report.wordCloud" :key="index" class="word-tag"
                            :style="{ fontSize: getWordSize(word.weight) + 'px' }">
                            {{ word.text }}
                        </span>
                    </div>
                </div>
            </div>

            <el-divider />

            <div class="report-analysis">
                <h3>详细分析</h3>
                <div class="analysis-content" v-html="report.analysisHtml"></div>
            </div>
        </main>

        <div v-else class="loading-container">
            <el-icon class="is-loading">
                <Loading />
            </el-icon>
            <span>正在加载报告...</span>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import axios from 'axios';

const props = defineProps({
    reportData: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['back']);

const report = ref(null);

// 加载报告数据
onMounted(() => {
    if (props.reportData) {
        report.value = props.reportData;
    } else {
        const reportData = localStorage.getItem('policyReport');
        if (reportData) {
            report.value = JSON.parse(reportData);
        } else {
            ElMessage.warning('未找到报告数据，请重新生成');
            emit('back');
        }
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

// 获取支持度标签
const getSupportLabel = (rate) => {
    if (rate >= 80) return '高度支持';
    if (rate >= 60) return '较为支持';
    if (rate >= 40) return '中立偏支持';
    if (rate >= 20) return '较低支持';
    return '低度支持';
};

// 获取反对度标签
const getOpposeLabel = (rate) => {
    if (rate >= 80) return '高度反对';
    if (rate >= 60) return '较为反对';
    if (rate >= 40) return '中立偏反对';
    if (rate >= 20) return '较低反对';
    return '低度反对';
};

// 获取进度条颜色
const getColorForRate = (rate) => {
    if (rate >= 80) return '#67C23A';
    if (rate >= 60) return '#85CE61';
    if (rate >= 40) return '#E6A23C';
    if (rate >= 20) return '#F56C6C';
    return '#F56C6C';
};

// 获取标签类型
const getTagType = (index) => {
    const types = ['', 'success', 'warning', 'danger', 'info'];
    return types[index % types.length];
};

// 获取词云字体大小
const getWordSize = (weight) => {
    // 根据权重返回12-30之间的字体大小
    return 12 + (weight / 100) * 18;
};

// 返回首页
const goBack = () => {
    emit('back');
};

// 导出到飞书
const exportToFeishu = async () => {
    try {
        const response = await axios.post('/api/policy/export-to-feishu', {
            reportId: report.value.id
        });

        ElMessage.success('成功导出到飞书文档');

        // 如果API返回了飞书文档链接，可以打开它
        if (response.data && response.data.feishuUrl) {
            window.open(response.data.feishuUrl, '_blank');
        }
    } catch (error) {
        ElMessage.error('导出失败，请重试');
        console.error('导出到飞书失败:', error);
    }
};
</script>

<style scoped>
.report-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    height: 100%;
    overflow-y: auto;
}

.report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.report-title {
    text-align: center;
    margin-bottom: 30px;
}

.report-title h1 {
    margin-bottom: 10px;
}

.report-meta {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
}

.report-summary {
    margin-bottom: 30px;
}

.report-metrics {
    margin-bottom: 30px;
}

.metric-card {
    margin-bottom: 20px;
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    color: #ffffff;
}

:deep(.el-card__header) {
    background-color: rgba(255, 255, 255, 0.15);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
}

.metric-value {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.metric-label {
    margin-top: 15px;
    font-size: 16px;
    font-weight: bold;
    color: #ffffff;
}

.report-tags {
    margin-bottom: 30px;
}

.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.tag-item {
    margin-right: 8px;
    margin-bottom: 8px;
    font-size: 14px;
    padding: 6px 12px;
}

.report-wordcloud {
    margin-bottom: 30px;
}

.wordcloud-container {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 20px;
    min-height: 200px;
}

.word-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 15px;
}

.word-tag {
    display: inline-block;
    padding: 5px;
    color: #ffffff;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}

.report-analysis {
    margin-bottom: 30px;
}

.analysis-content {
    line-height: 1.8;
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

.gradient-button {
    font-size: 16px;
    padding: 12px 24px;
    border-radius: 6px;
    border: none;
    color: #ffffff;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    background-size: 200% auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
}

.gradient-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.gradient-button:hover::before {
    opacity: 1;
}

.gradient-button:active {
    transform: translateY(2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.primary-button {
    background-image: linear-gradient(45deg, rgba(255, 184, 108, 0.8), rgba(252, 96, 118, 0.8), rgba(255, 137, 167, 0.8));
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.secondary-button {
    background-image: linear-gradient(45deg, rgba(142, 68, 173, 0.8), rgba(127, 140, 141, 0.6), rgba(142, 68, 173, 0.8));
    border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.el-progress) {
    --el-progress-text-color: #ffffff;
}
</style>