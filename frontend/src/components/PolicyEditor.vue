<template>
    <div class="policy-editor-container">
        <header class="editor-header">
            <h2>政策编辑</h2>
            <div class="header-actions">
                <el-button @click="goBack" :disabled="isSubmitting || isGeneratingReport">返回</el-button>
                <el-button type="primary" @click="submitPolicy" :loading="isSubmitting"
                    :disabled="isSubmitting || isGeneratingReport">
                    {{ isSubmitting ? '正在分析...' : '提交政策' }}
                </el-button>
            </div>
        </header>

        <main class="editor-main">
            <div class="editor-wrapper">
                <div class="editor-title">
                    <el-input v-model="policyTitle" placeholder="政策名称" maxlength="100"
                        :disabled="isSubmitting || isGeneratingReport" />
                </div>

                <div class="editor-content">
                    <div style="background-color: white;">
                        <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" mode="default" />
                        <Editor style="height:45vh; overflow-y: hidden;" v-model="editorContent"
                            :defaultConfig="editorConfig" mode="default" @onCreated="handleCreated"
                            :disabled="isSubmitting || isGeneratingReport" />
                    </div>
                </div>
            </div>
        </main>

        <!-- 政策细化对话框 -->
        <el-dialog v-model="dialogVisible" title="政策细化" width="60%" :before-close="handleClose" class="policy-dialog"
            center :close-on-click-modal="false" :close-on-press-escape="false">
            <div v-if="policyAnalysis">
                <div class="policy-summary">
                    <p>{{ policyAnalysis.summary }}</p>
                </div>

                <div class="policy-questions">
                    <h3>请完善以下信息</h3>
                    <div v-for="question in policyAnalysis.questions" :key="question.id" class="question-item">
                        <h4>{{ question.id }}. {{ question.title }}</h4>

                        <!-- 文本输入题 -->
                        <el-input v-if="question.type === 'text'" v-model="question.answer" type="textarea" :rows="3"
                            :placeholder="question.placeholder" :disabled="isGeneratingReport" />

                        <!-- 单选题 -->
                        <el-radio-group v-else-if="question.type === 'choice'" v-model="question.answer"
                            :disabled="isGeneratingReport">
                            <el-radio v-for="(option, index) in question.options" :key="index" :label="option">
                                {{ option }}
                            </el-radio>
                        </el-radio-group>

                        <!-- 多选题 -->
                        <el-checkbox-group v-else-if="question.type === 'multiple'" v-model="question.answer"
                            :disabled="isGeneratingReport">
                            <el-checkbox v-for="(option, index) in question.options" :key="index" :label="option">
                                {{ option }}
                            </el-checkbox>
                        </el-checkbox-group>

                        <!-- 判断题 -->
                        <el-radio-group v-else-if="question.type === 'boolean'" v-model="question.answer"
                            :disabled="isGeneratingReport">
                            <el-radio :label="true">是</el-radio>
                            <el-radio :label="false">否</el-radio>
                        </el-radio-group>
                    </div>
                </div>
            </div>
            <div v-else class="loading-analysis">
                <el-icon class="is-loading">
                    <Loading />
                </el-icon>
                <span>正在分析政策内容...</span>
            </div>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false" :disabled="isGeneratingReport">取消</el-button>
                    <el-button v-if="policyAnalysis" type="primary" @click="submitDetailedPolicy"
                        :loading="isGeneratingReport" :disabled="isGeneratingReport">
                        {{ isGeneratingReport ? '正在生成报告...' : '提交' }}
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, shallowRef, onBeforeUnmount, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { Loading } from '@element-plus/icons-vue';
import axios from 'axios';

const emit = defineEmits(['back', 'showReport']);

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// 内容 HTML
const editorContent = ref('');
const policyTitle = ref('');
const dialogVisible = ref(false);
const policyAnalysis = ref(null);
const isSubmitting = ref(false);
const isGeneratingReport = ref(false);

// 工具栏配置
const toolbarConfig = {
    excludeKeys: []
};

// 编辑器配置
const editorConfig = {
    placeholder: '请输入政策内容...',
    MENU_CONF: {}
};

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
    const editor = editorRef.value;
    if (editor == null) return;
    editor.destroy();
});

// 编辑器回调函数
const handleCreated = (editor) => {
    editorRef.value = editor; // 记录 editor 实例
};

// 返回上一页
const goBack = () => {
    emit('back');
};

// 提交政策
const submitPolicy = async () => {
    if (!policyTitle.value.trim()) {
        ElMessage.warning('请输入政策标题');
        return;
    }

    if (!editorContent.value.trim()) {
        ElMessage.warning('请输入政策内容');
        return;
    }

    isSubmitting.value = true;
    dialogVisible.value = true;

    try {
        // 调用一号接口，获取政策分析和细化问题
        const response = await axios.post('/api/policy/analyze', {
            title: policyTitle.value,
            content: editorContent.value
        });

        policyAnalysis.value = response.data;
    } catch (error) {
        ElMessage.error('政策分析失败，请重试');
        console.error('政策分析失败:', error);
        dialogVisible.value = false;
    } finally {
        isSubmitting.value = false;
    }
};

// 提交详细政策
const submitDetailedPolicy = async () => {
    try {
        // 检查是否所有问题都已回答
        const allAnswered = policyAnalysis.value.questions.every(q => {
            if (q.type === 'text') {
                return q.answer && q.answer.trim();
            } else if (q.type === 'choice' || q.type === 'boolean') {
                return q.answer !== null && q.answer !== undefined && q.answer !== '';
            } else if (q.type === 'multiple') {
                return q.answer && q.answer.length > 0;
            }
            return false;
        });

        if (!allAnswered) {
            ElMessage.warning('请回答所有问题');
            return;
        }

        isGeneratingReport.value = true;

        // 调用二号接口，获取政策分析报告
        const response = await axios.post('/api/policy/analyze-detailed', {
            title: policyTitle.value,
            content: editorContent.value,
            analysis: policyAnalysis.value
        });

        // 存储报告数据并通知父组件显示报告
        localStorage.setItem('policyReport', JSON.stringify(response.data));
        emit('showReport', response.data);
        dialogVisible.value = false;
    } catch (error) {
        ElMessage.error('提交失败，请重试');
        console.error('提交详细政策失败:', error);
    } finally {
        isGeneratingReport.value = false;
    }
};

// 关闭对话框
const handleClose = () => {
    dialogVisible.value = false;
};
</script>

<style>
/* 引入编辑器样式 */
@import '@wangeditor/editor/dist/css/style.css';

/* 自定义编辑器样式 */
.w-e-toolbar {
    background-color: transparent !important;
}
</style>

<style scoped>
.policy-editor-container {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 100%;
    padding: 20px;
    overflow-y: auto;
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
}

.editor-main {
    flex: 1;
}

.editor-wrapper {
    max-width: 1000px;
    margin: 0 auto;
}

.editor-title {
    margin-bottom: 20px;
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

:deep(.el-radio) {
    --el-radio-font-color: #ffffff;
    --el-radio-input-border-color: rgba(255, 255, 255, 0.5);
    --el-radio-checked-text-color: #d896c4;
    --el-radio-checked-icon-color: #d896c4;
    --el-radio-checked-input-border-color: #d896c4;
    margin-right: 20px;
    margin-bottom: 10px;
}

:deep(.el-radio__inner) {
    border-color: #d896c4;
    background-color: transparent;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
    border-color: #d896c4;
    background: #d896c4;
}

:deep(.el-radio__inner::after) {
    background-color: #fff;
}

:deep(.el-radio__label) {
    color: #ffffff;
}

:deep(.el-radio.is-checked .el-radio__label) {
    color: #d896c4;
    font-weight: bold;
}

:deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;
}

:deep(.el-checkbox) {
    --el-checkbox-font-color: #ffffff;
    --el-checkbox-input-border-color: #d896c4;
    --el-checkbox-checked-text-color: #d896c4;
    --el-checkbox-checked-icon-color: #ffffff;
    --el-checkbox-checked-input-border-color: #d896c4;
    --el-checkbox-checked-bg-color: #d896c4;
    margin-right: 20px;
    margin-bottom: 10px;
}

:deep(.el-checkbox__label) {
    color: #ffffff;
}

:deep(.el-checkbox.is-checked .el-checkbox__label) {
    color: #d896c4;
    font-weight: bold;
}

:deep(.el-checkbox-group) {
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;
}

.policy-summary {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
}

.policy-summary h3 {
    margin-top: 0;
    margin-bottom: 10px;
    font-family: serif;
    letter-spacing: 1px;
}

.policy-questions h3 {
    margin-bottom: 15px;
    font-family: serif;
    letter-spacing: 1px;
}

.question-item {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
}

.question-item h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #ffffff;
    font-family: serif;
    letter-spacing: 1px;
}

.loading-analysis {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
}

.loading-analysis .el-icon {
    font-size: 40px;
    margin-bottom: 15px;
    color: #ffffff;
}

:deep(.policy-dialog) {
    --el-dialog-bg-color: rgba(149, 64, 107, 0.95);
    --el-dialog-text-color: #ffffff;
    --el-dialog-border-color: rgba(255, 255, 255, 0.2);
    --el-dialog-box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    --el-dialog-padding-primary: 20px;
    border-radius: 12px;
    overflow: hidden;
}

:deep(.el-dialog__header) {
    background: rgba(149, 64, 107, 0.8);
    padding: 15px 20px;
}

:deep(.el-dialog__title) {
    color: #ffffff;
    font-family: serif;
    font-weight: bold;
    font-size: 22px;
    letter-spacing: 2px;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
    color: rgba(255, 255, 255, 0.8);
    font-size: 20px;
}

:deep(.el-dialog__headerbtn:hover .el-dialog__close) {
    color: #ffffff;
    transform: scale(1.1);
}

:deep(.el-dialog__body) {
    color: #ffffff;
    padding: 20px;
}

:deep(.el-dialog__footer) {
    background: rgba(149, 64, 107, 0.8);
    padding: 15px 20px;
}

.dialog-footer {
    display: flex;
    justify-content: center;
    gap: 20px;
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

.header-actions :deep(.el-button) {
    padding: 8px 16px;
}

.header-actions :deep(.el-button span) {
    font-size: 16px;
}

.dialog-footer :deep(.el-button) {
    padding: 8px 20px;
}

.dialog-footer :deep(.el-button span) {
    font-size: 16px;
}
</style>