<script setup lang="ts">
import { computed, ref } from 'vue'
import { useReplayStore } from '../../stores/replayStore'
import type { JobInfo } from '../../types/replay'

const props = defineProps<{
  nodeId: number
  gpus?: number[] // 可能为 undefined，代表该节点完全空闲
}>()

const store = useReplayStore()

// 为了视觉美观，定义一个极简的颜色池
const colorPalette = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f43f5e',
]

// 如果当前节点在这一帧没有被分配（undefined），默认生成 8 个 -1（代表空闲）
const currentGpus = computed(() => {
  return props.gpus || [-1, -1, -1, -1, -1, -1, -1, -1]
})

// 根据 Job ID 获取颜色
const getGpuColor = (jobId: number) => {
  if (jobId === -1) return '#e5e7eb' // 灰色代表空闲
  return colorPalette[jobId % colorPalette.length]
}

// ==========================================
// Tooltip 交互逻辑
// ==========================================
const hoveredJobId = ref<number | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

const hoveredJobInfo = computed<JobInfo | null>(() => {
  if (hoveredJobId.value === null || hoveredJobId.value === -1) return null
  return store.jobInfoDict[hoveredJobId.value.toString()] || null
})

const inferredStatus = computed(() => {
  if (hoveredJobId.value === null) return ''
  return 'RUNNING'
})

const handleMouseEnter = (event: MouseEvent, jobId: number) => {
  if (jobId === -1) return
  hoveredJobId.value = jobId
  tooltipPosition.value = { x: event.clientX + 15, y: event.clientY + 15 }
}

const handleMouseMove = (event: MouseEvent) => {
  if (hoveredJobId.value !== null) {
    tooltipPosition.value = { x: event.clientX + 15, y: event.clientY + 15 }
  }
}

const handleMouseLeave = () => {
  hoveredJobId.value = null
}
</script>

<template>
  <div class="node-container">
    <div class="node-header">Node {{ nodeId }}</div>
    <div class="gpu-grid">
      <!-- 渲染 8 个 GPU 小方块 -->
      <div
        v-for="(jobId, index) in currentGpus"
        :key="index"
        class="gpu-block"
        :style="{ backgroundColor: getGpuColor(jobId) }"
        @mouseenter="(e) => handleMouseEnter(e, jobId)"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      ></div>
    </div>

    <!-- 悬浮黑卡 (Tooltip) -->
    <Teleport to="body">
      <div
        v-if="hoveredJobInfo"
        class="job-tooltip"
        :style="{ left: tooltipPosition.x + 'px', top: tooltipPosition.y + 'px' }"
      >
        <div class="tt-header">
          <span class="tt-job-id">Job {{ hoveredJobId }}</span>
          <span class="tt-status running">{{ inferredStatus }}</span>
        </div>
        <div class="tt-body">
          <div class="tt-row">
            <span class="tt-label">Group:</span>
            <span class="tt-value"
              >{{ hoveredJobInfo.group }} (ID: {{ hoveredJobInfo.member_id }})</span
            >
          </div>
          <div class="tt-row">
            <span class="tt-label">Fate:</span>
            <span class="tt-value highlight-fate">
              {{
                hoveredJobInfo.target_ratio === 1.0
                  ? '100% (Survive)'
                  : `${Math.round(hoveredJobInfo.target_ratio * 100)}% (Kill)`
              }}
            </span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<!-- 👇 这是你原本的 CSS，保证方块正常显示 -->
<style scoped lang="scss">
.node-container {
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.node-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 6px;
  text-align: center;
}

.gpu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); // 4 列 2 行的经典排列
  gap: 4px;
}

.gpu-block {
  width: 100%;
  aspect-ratio: 1 / 1; // 保持正方形
  border-radius: 2px;
  transition: background-color 0.3s ease;
  cursor: pointer;

  /* 给有任务的方块加一点内阴影使其更有质感 */
  &:not([style*='rgb(229, 231, 235)']) {
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
  }
}
</style>

<!-- 👇 这是 Tooltip 独有的 CSS (不需要 scoped，因为挂载到了 body 上) -->
<style lang="scss">
.job-tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;

  width: 220px;
  background-color: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(4px);
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 12px;
  color: #f3f4f6;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);

  animation: tooltipFadeIn 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes tooltipFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.tt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #374151;
  padding-bottom: 8px;
  margin-bottom: 8px;

  .tt-job-id {
    font-weight: bold;
    font-size: 0.9rem;
    color: #fff;
  }

  .tt-status {
    font-size: 0.65rem;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;

    &.running {
      background-color: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }
  }
}

.tt-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.8rem;

  .tt-row {
    display: flex;
    justify-content: space-between;

    .tt-label {
      color: #9ca3af;
    }
    .tt-value {
      font-weight: 500;
    }
    .highlight-fate {
      color: #fca5a5;
      font-family: monospace;
    }
  }
}
</style>
