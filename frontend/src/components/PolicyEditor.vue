<template>
    <div class="policy-editor-container">
        <header class="editor-header">
            <h2>政策编辑</h2>
            <div class="header-actions">
                <button class="gradient-button secondary-button" @click="goBack">返回</button>
                <button class="gradient-button primary-button" @click="submitPolicy">提交政策</button>
            </div>
        </header>

        <main class="editor-main">
            <div class="editor-wrapper">
                <div class="editor-title">
                    <el-input v-model="policyTitle" placeholder="请输入政策标题" maxlength="100" show-word-limit />
                </div>

                <div class="editor-content">
                    <div style="border: 1px solid rgba(255, 255, 255, 0.2); z-index: 100">
                        <Toolbar style="border-bottom: 1px solid rgba(255, 255, 255, 0.2)" :editor="editorRef"
                            :defaultConfig="toolbarConfig" mode="default" />
                        <Editor style="height: 500px; overflow-y: hidden;" v-model="editorContent"
                            :defaultConfig="editorConfig" mode="default" @onCreated="handleCreated" />
                    </div>
                </div>
            </div>
        </main>

        <!-- 政策细化对话框 -->
        <el-dialog v-model="dialogVisible" title="政策细化" width="60%" :before-close="handleClose" class="policy-dialog">
            <div v-if="policyAnalysis">
                <div class="policy-summary">
                    <h3>政策主题总结</h3>
                    <p>{{ policyAnalysis.summary }}</p>
                </div>

                <div class="policy-questions">
                    <h3>请完善以下信息</h3>
                    <div v-for="(question, index) in policyAnalysis.questions" :key="index" class="question-item">
                        <h4>{{ question.title }}</h4>
                        <el-input v-model="question.answer" type="textarea" :rows="3"
                            :placeholder="question.placeholder" />
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
                    <button class="gradient-button secondary-button" @click="dialogVisible = false">取消</button>
                    <button class="gradient-button primary-button" @click="submitDetailedPolicy"
                        :disabled="!policyAnalysis">
                        提交
                    </button>
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
    }
};

// 提交详细政策
const submitDetailedPolicy = async () => {
    try {
        // 检查是否所有问题都已回答
        const allAnswered = policyAnalysis.value.questions.every(q => q.answer && q.answer.trim());

        if (!allAnswered) {
            ElMessage.warning('请回答所有问题');
            return;
        }

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
    background-color: rgba(148, 0, 211, 0.8) !important;
    color: #fff !important;
}

.w-e-text-container {
    background-color: rgba(255, 255, 255, 0.1) !important;
}

.w-e-text {
    color: #fff !important;
}

.w-e-panel-container {
    color: #fff !important;
}
</style>

<style scoped>
.policy-editor-container {
    display: flex;
    flex-direction: column;
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
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
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
}

:deep(.el-textarea) {
    --el-input-bg-color: rgba(255, 255, 255, 0.1);
    --el-input-border-color: rgba(255, 255, 255, 0.2);
    --el-input-text-color: #ffffff;
    --el-input-placeholder-color: rgba(255, 255, 255, 0.6);
}

.policy-summary {
    margin-bottom: 20px;
}

.question-item {
    margin-bottom: 20px;
}

.question-item h4 {
    margin-bottom: 10px;
    color: #ffffff;
}

.loading-analysis {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
}

.loading-analysis .el-icon {
    font-size: 30px;
    margin-bottom: 15px;
    color: #ffffff;
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
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.secondary-button {
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.gradient-button[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
}

:deep(.policy-dialog) {
    --el-dialog-text-color: #ffffff;
    --el-dialog-border-color: rgba(255, 255, 255, 0.2);
}

:deep(.el-dialog__title) {
    color: #ffffff;
}

:deep(.el-dialog__header) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.el-dialog__body) {
    color: #ffffff;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>