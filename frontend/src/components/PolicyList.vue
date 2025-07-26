<template>
    <div class="policy-list-container">
        <header class="list-header">
            <h2>现有政策</h2>
            <div class="header-actions">
                <el-button @click="goBack">返回</el-button>
            </div>
        </header>

        <main class="list-content">
            <div v-if="policyList.length === 0" class="empty-state">
                <p>暂无政策数据</p>
            </div>
            <div v-else class="policy-grid">
                <div v-for="(policy, index) in policyList" :key="policy.id" class="policy-card"
                    @click="viewDetail(policy.id)">
                    <div class="policy-number">#{{ index + 1 }}</div>
                    <h3>{{ policy.title }}</h3>
                    <p class="policy-date">{{ formatDate(policy.createdAt) }}</p>
                    <div class="card-actions">
                        <el-button size="small" type="primary">查看详情</el-button>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    policyList: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['back', 'viewDetail']);

const goBack = () => {
    emit('back');
};

const viewDetail = (id) => {
    emit('viewDetail', id);
};

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
</script>

<style scoped>
.policy-list-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
}

.list-content {
    flex: 1;
}

.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: rgba(255, 255, 255, 0.6);
}

.policy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.policy-card {
    background: linear-gradient(135deg, rgba(149, 64, 107, 0.3), rgba(126, 50, 88, 0.3));
    backdrop-filter: blur(7px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.policy-card:hover {
    background-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
}

.policy-number {
    position: absolute;
    top: 15px;
    right: 15px;
    background: linear-gradient(135deg, rgba(149, 64, 107, 0.9), rgba(126, 50, 88, 0.9));
    color: #ffffff;
    font-size: 14px;
    font-weight: bold;
    padding: 5px 10px;
    border-radius: 12px;
    letter-spacing: 1px;
    box-shadow: 0 2px 8px rgba(149, 64, 107, 0.4);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    z-index: 1;
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);
}

.policy-card:hover .policy-number {
    box-shadow: 0 4px 15px rgba(149, 64, 107, 0.6);
    border-color: rgba(255, 255, 255, 0.5);
}

.policy-card h3 {
    margin: 0 60px 10px 0;
    color: #ffffff;
    font-size: 18px;
    line-height: 1.4;
}

.policy-date {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    margin: 0 0 15px 0;
}

.card-actions {
    display: flex;
    justify-content: flex-end;
}

:deep(.el-button) {
    background: rgba(149, 64, 107, 0.8);
    border: none;
    box-shadow: 0 0 10px 0 rgba(126, 50, 88, 0.8);
    color: #ffffff;
    padding: 17px 15px !important;
    position: relative;
}

:deep(.el-button span) {
    font-family: serif;
    font-weight: bold;
    font-size: 13px !important;
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
</style>