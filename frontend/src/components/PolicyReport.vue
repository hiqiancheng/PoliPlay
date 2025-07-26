<template>
    <div class="report-container">
        <header class="report-header">
            <h2>政策分析报告</h2>
            <div class="header-actions">
                <el-button @click="goBack">返回</el-button>
                <el-button type="primary" @click="exportToFeishu">导出到飞书</el-button>
            </div>
        </header>

        <main class="report-content" v-if="report">
            <div class="report-title">
                <h1>{{ report.title }}</h1>
                <div class="report-meta">
                    <span>生成时间: {{ formatDate(report.generatedAt) }}</span>
                </div>
            </div>

            <div class="report-summary">
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

            <!-- 角色回答意见记录 -->
            <div class="report-role-opinions" v-if="report.comments && report.comments.length > 0">
                <h3>角色回答意见记录</h3>

                <!-- 统计摘要 -->
                <div class="opinions-summary">
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <div class="summary-item">
                                <div class="summary-number">{{ report.comments.length }}</div>
                                <div class="summary-label">参与角色</div>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="summary-item">
                                <div class="summary-number">{{ getAverageScore() }}</div>
                                <div class="summary-label">平均评分</div>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="summary-item">
                                <div class="summary-number">{{ getHighestScoreRole() }}</div>
                                <div class="summary-label">最高评分角色</div>
                            </div>
                        </el-col>
                    </el-row>
                </div>

                <div class="opinions-container">
                    <el-card v-for="(opinion, index) in report.comments" :key="index" class="opinion-card"
                        @click="showOpinionDetail(opinion)">
                        <div class="opinion-header">
                            <div class="role-info">
                                <span class="role-name">{{ opinion.role }}</span>
                                <div class="role-score">
                                    <el-rate :model-value="opinion.score" :max="5" disabled show-score
                                        text-color="#ffffff" score-template="{value}分" />
                                </div>
                            </div>
                        </div>
                        <div class="opinion-content">
                            <p class="opinion-comment">{{ opinion.comment }}</p>
                        </div>
                        <div class="click-hint">
                            <el-icon class="expand-icon">
                                <ArrowRight />
                            </el-icon>
                            <span>点击查看完整意见</span>
                        </div>
                    </el-card>
                </div>
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
                    <div ref="wordCloudContainer" class="word-cloud"></div>
                </div>
            </div>

            <div class="report-analysis">
                <h3>详细分析报告见飞书文档</h3>
                <el-button type="primary" @click="exportToFeishu">在飞书打开</el-button>
            </div>
        </main>

        <div v-else class="loading-container">
            <el-icon class="is-loading">
                <Loading />
            </el-icon>
            <span>正在加载报告...</span>
        </div>

        <!-- 意见详情弹窗 -->
        <el-dialog v-model="dialogVisible" :title="null" width="60%" :before-close="handleClose" class="opinion-dialog"
            center :show-close="false">
            <div class="dialog-content" v-if="selectedOpinion">
                <!-- 自定义标题栏 -->
                <div class="custom-header">
                    <div class="header-left">
                        <div class="role-info-large">
                            <h2 class="role-title">{{ selectedOpinion.role }}的详细意见</h2>
                            <div class="role-rating-large">
                                <el-rate :model-value="selectedOpinion.score" :max="5" disabled show-score
                                    score-template="评分: {value}/5" size="large" />
                            </div>
                        </div>
                    </div>
                    <el-button class="close-btn" @click="dialogVisible = false" circle size="large">
                        <el-icon>
                            <Close />
                        </el-icon>
                    </el-button>
                </div>

                <!-- 内容区域 -->
                <div class="dialog-main">
                    <div class="comment-section">
                        <div class="comment-content">
                            <p class="full-comment-text">{{ selectedOpinion.comment }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Loading, ArrowRight, Close, ChatLineRound } from '@element-plus/icons-vue';
import axios from 'axios';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

const props = defineProps({
    reportData: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['back']);

const report = ref(null);
const wordCloudContainer = ref(null);
const dialogVisible = ref(false);
const selectedOpinion = ref(null);

// 加载报告数据
onMounted(() => {
    if (props.reportData) {
        report.value = props.reportData;
        renderWordCloud();
    } else {
        const reportData = localStorage.getItem('policyReport');
        if (reportData) {
            report.value = JSON.parse(reportData);
            renderWordCloud();
        } else {
            ElMessage.warning('未找到报告数据，请重新生成');
            emit('back');
        }
    }
});

// 监听报告数据变化
watch(() => report.value, (newVal) => {
    if (newVal) {
        renderWordCloud();
    }
}, { deep: true });

// 渲染词云
const renderWordCloud = () => {
    if (!report.value || !report.value.wordCloud || !wordCloudContainer.value) return;

    // 清空容器
    d3.select(wordCloudContainer.value).selectAll("*").remove();

    const width = wordCloudContainer.value.clientWidth;
    const height = 400;

    // 定义颜色范围
    const colorScale = d3.scaleOrdinal()
        .domain([0, report.value.wordCloud.length])
        .range([
            "#d896c4", "#b5689d", "#95406b", "#7d3359",
            "#c285b5", "#aa6d9c", "#9c5c8e", "#8e4a7f"
        ]);

    // 创建词云布局
    const layout = cloud()
        .size([width, height])
        .words(report.value.wordCloud.map(d => ({
            text: d.text,
            size: 10 + (d.weight / 10), // 根据权重调整字体大小
            weight: d.weight
        })))
        .padding(5)
        .rotate(() => 0) // 不旋转文字
        .font("微软雅黑")
        .fontSize(d => d.size)
        .on("end", draw);

    // 开始布局
    layout.start();

    // 绘制词云
    function draw(words) {
        d3.select(wordCloudContainer.value)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("class", "wordcloud-svg")
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`)
            .selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-size", d => `${d.size}px`)
            .style("font-family", "微软雅黑")
            .style("fill", (d, i) => colorScale(i))
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .text(d => d.text);
    }
};

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

// 返回首页
const goBack = () => {
    emit('back');
};

// 计算平均评分
const getAverageScore = () => {
    if (!report.value || !report.value.comments || report.value.comments.length === 0) {
        return '0.0';
    }
    const totalScore = report.value.comments.reduce((sum, comment) => sum + comment.score, 0);
    return (totalScore / report.value.comments.length).toFixed(1);
};

// 获取最高评分角色
const getHighestScoreRole = () => {
    if (!report.value || !report.value.comments || report.value.comments.length === 0) {
        return '无';
    }
    const highestScoreComment = report.value.comments.reduce((max, comment) =>
        comment.score > max.score ? comment : max
    );
    return highestScoreComment.role;
};

// 显示意见详情
const showOpinionDetail = (opinion) => {
    selectedOpinion.value = opinion;
    dialogVisible.value = true;
};

// 关闭弹窗
const handleClose = (done) => {
    selectedOpinion.value = null;
    if (done) {
        done();
    }
};

// 导出到飞书
const exportToFeishu = async () => {
    try {
        if (!report.value || !report.value.id) {
            ElMessage.error('报告数据不完整，无法导出');
            return;
        }

        ElMessage.info('正在导出到飞书文档，请稍候...');

        const response = await axios.post('/api/policy/export-feishu', {
            reportId: report.value.id
        });

        if (response.data && response.data.success) {
            ElMessage.success(response.data.message || '成功导出到飞书文档');

            // 如果API返回了飞书文档链接，可以打开它
            if (response.data.feishuUrl) {
                window.open(response.data.feishuUrl, '_blank');
            }
        } else {
            ElMessage.error('导出失败: ' + (response.data.error || '未知错误'));
        }
    } catch (error) {
        console.error('导出到飞书失败:', error);

        if (error.response && error.response.data) {
            ElMessage.error('导出失败: ' + error.response.data.error);
        } else {
            ElMessage.error('导出失败，请检查网络连接或稍后重试');
        }
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
    box-sizing: border-box;
}

.report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
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
    background: linear-gradient(135deg, rgba(149, 64, 107, 0.3), rgba(126, 50, 88, 0.3));
    color: #ffffff;
    backdrop-filter: blur(7px);
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.metric-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(149, 64, 107, 0.4);
    border-color: rgba(255, 255, 255, 0.15);
}


:deep(.el-card__header) {
    background: linear-gradient(135deg, rgba(149, 64, 107, 0.7), rgba(126, 50, 88, 0.6));
    border-bottom: none;
    color: #ffffff;
    text-align: center;
}

:deep(.el-dialog__header) {
    padding: 0 !important;
    margin: 0;
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

.report-role-opinions {
    margin-bottom: 30px;
}

.report-role-opinions h3 {
    color: #ffffff;
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: bold;
}

.opinions-summary {
    margin-bottom: 25px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(149, 64, 107, 0.2), rgba(126, 50, 88, 0.2));
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-item {
    text-align: center;
    padding: 15px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    transition: transform 0.3s ease;
}

.summary-item:hover {
    transform: translateY(-3px);
}

.summary-number {
    font-size: 28px;
    font-weight: bold;
    color: rgb(249, 193, 72);
    margin-bottom: 8px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.summary-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
}

.opinions-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.opinion-card {
    background: linear-gradient(135deg, rgba(149, 64, 107, 0.3), rgba(126, 50, 88, 0.3));
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    cursor: pointer;
    position: relative;
}

.opinion-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(149, 64, 107, 0.4);
    border-color: rgba(255, 255, 255, 0.4);
}

.opinion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.role-info {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
}

.role-name {
    font-size: 18px;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.role-score {
    color: #ffffff;
}

.opinion-content {
    margin-top: 15px;
}

.opinion-comment {
    font-size: 15px;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.9);
    text-align: justify;
    font-style: italic;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.click-hint {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    margin-top: 15px;
    padding-top: 10px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    transition: color 0.3s ease;
}

.click-hint .expand-icon {
    margin-right: 5px;
    font-size: 14px;
}

.opinion-card:hover .click-hint {
    color: rgba(255, 255, 255, 0.9);
}

/* 评分组件样式 */
:deep(.el-rate) {
    --el-rate-icon-size: 16px;
    --el-rate-icon-margin: 2px;
}

:deep(.el-rate__text) {
    font-size: 14px;
    font-weight: bold;
    margin-left: 8px;
}

:deep(.el-rate__icon) {
    color: #ffd700;
}

:deep(.el-rate__icon.is-disabled) {
    color: #ffd700;
}

/* 弹窗样式 */
:deep(.opinion-dialog .el-dialog) {
    background: linear-gradient(135deg, rgba(18, 18, 30, 0.98), rgba(30, 20, 40, 0.98));
    backdrop-filter: blur(30px);
    border-radius: 20px;
    border: 2px solid rgba(149, 64, 107, 0.3);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    max-height: 90vh;
    overflow: hidden;
}

:deep(.el-dialog) {
    padding: 0 !important;
}

:deep(.opinion-dialog .el-dialog__body) {
    padding: 0;
    color: #ffffff;
    overflow-y: auto;
    max-height: 80vh;
}

.dialog-content {
    color: #ffffff;
}

/* 自定义标题栏 */
.custom-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30px;
    background: linear-gradient(135deg, rgba(149, 64, 107, 0.8), rgba(126, 50, 88, 0.8));
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.header-left {
    display: flex;
    align-items: center;
}

.role-avatar-large {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(149, 64, 107, 0.9), rgba(200, 100, 150, 0.9));
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 25px;
    box-shadow: 0 8px 25px rgba(149, 64, 107, 0.4);
    border: 3px solid rgba(255, 255, 255, 0.2);
}

.role-initial-large {
    font-size: 32px;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.role-info-large {
    flex: 1;
}

.role-title {
    margin: 0 0 5px 0;
    font-size: 21px;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.role-rating-large {
    color: #ffffff;
}

.close-btn {
    background: rgba(255, 255, 255, 0.1) !important;
    color: #ffffff !important;
    transition: all 0.3s ease;
}

:deep(.close-btn) {
    padding: 0 !important;
    box-shadow: none !important;
}

:deep(.close-btn::after) {
    display: none !important;
}

.close-btn:hover {
    border-color: rgba(255, 255, 255, 0.5) !important;
    transform: scale(1.1);
}

/* 主内容区域 */
.dialog-main {
    padding: 40px;
}

.comment-section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 30px;
}

.section-title {
    display: flex;
    align-items: center;
    margin-bottom: 25px;
    font-size: 20px;
    font-weight: bold;
    color: rgba(149, 64, 107, 0.9);
}

.title-icon {
    margin-right: 10px;
    font-size: 24px;
    color: rgba(149, 64, 107, 0.8);
}

.comment-content {
    border-radius: 12px;
    padding: 25px;
    padding-left: 15px;
}

.full-comment-text {
    font-size: 18px;
    line-height: 2;
    color: rgba(149, 64, 107, 0.8);
    text-align: justify;
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    letter-spacing: 0.5px;
}

/* 评分组件样式调整 */
:deep(.role-rating-large .el-rate) {
    --el-rate-icon-size: 20px;
    --el-rate-icon-margin: 4px;
}

:deep(.role-rating-large .el-rate__text) {
    font-size: 16px;
    font-weight: bold;
    margin-left: 12px;
    color: #ffffff;
}

:deep(.role-rating-large .el-rate__icon) {
    color: #ffd700;
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
    min-height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.word-cloud {
    width: 100%;
    height: 400px;
    overflow: hidden;
}

.wordcloud-svg text {
    cursor: pointer;
    transition: font-size 0.3s ease;
}

.wordcloud-svg text:hover {
    font-size: 120%;
}

.report-analysis {
    margin-bottom: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 25px;
}

.report-analysis .el-button {
    padding: 20px 15px;
    font-size: 13px;
}

:deep(.report-analysis .el-button span) {
    font-size: 15px !important;
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

:deep(.el-button) {
    background: rgba(149, 64, 107, 0.8);
    border: none;
    box-shadow: 0 0 10px 0 rgba(126, 50, 88, 0.8);
    color: #ffffff;
    font-size: 16px;
    padding: 12px 24px;
    position: relative;
}

:deep(.el-button span) {
    font-family: serif;
    font-weight: bold;
    font-size: 18px;
    letter-spacing: 2px;
}

:deep(.el-button:hover) {
    background: rgba(149, 64, 107, 0.4);
    transform: scale(1.05);
}

:deep(.el-progress__text) {
    font-size: 16px;
    font-weight: bold;
    color: #ffffff;
}

.header-actions :deep(.el-button) {
    padding: 8px 16px;
}

.header-actions :deep(.el-button span) {
    font-size: 16px;
}

:deep(.el-progress) {
    --el-progress-text-color: #ffffff;
}
</style>