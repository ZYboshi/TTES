<script setup lang="ts">
import { useReplayStore } from '../../stores/replayStore'
import NodeBox from './NodeBox.vue'

// 拿到大脑的控制权
const store = useReplayStore()
</script>

<template>
  <div class="cluster-dashboard">
    <div class="dashboard-header">
      <h2>GPU Cluster Matrix</h2>
      <div class="meta-info" v-if="store.meta">
        <span class="badge">Nodes: {{ store.meta.total_nodes }}</span>
        <span class="badge">GPUs/Node: {{ store.meta.gpus_per_node }}</span>
      </div>
    </div>

    <!-- 数据尚未加载或加载失败的提示 -->
    <div v-if="!store.meta || !store.currentFrame" class="loading-state">
      Waiting for replay.json data...
    </div>

    <!-- 128 节点的渲染网格 -->
    <div v-else class="cluster-grid">
      <!-- 循环 n 次（从 1 到 total_nodes） -->
      <NodeBox
        v-for="n in store.meta.total_nodes"
        :key="n"
        :nodeId="n - 1"
        :gpus="store.currentFrame.cluster_state[n - 1]"
      />
      <!--
        核心逻辑解密：
        :nodeId="n - 1" 因为节点编号从 0 开始
        :gpus="..." 我们直接去当前帧的稀疏字典里查这个节点有没有数组。
        如果字典里没有这个键，传过去的就是 undefined，子组件会自己画空闲！
      -->
    </div>
  </div>
</template>

<style scoped lang="scss">
.cluster-dashboard {
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 12px;
  min-height: calc(100vh - 100px); // 占满大部分屏幕
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e5e7eb;

  h2 {
    margin: 0;
    color: #1f2937;
    font-size: 1.5rem;
  }
}

.meta-info {
  display: flex;
  gap: 10px;

  .badge {
    background-color: #e0e7ff;
    color: #4338ca;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 600;
  }
}

.loading-state {
  text-align: center;
  padding: 50px;
  color: #6b7280;
  font-size: 1.2rem;
}

// 核心的 128 节点大网格
.cluster-grid {
  display: grid;
  // 响应式列数：大屏幕 16 列，中屏幕 8 列
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}
</style>
