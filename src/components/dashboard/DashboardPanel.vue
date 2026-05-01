<script setup lang="ts">
import { useReplayStore } from '../../stores/replayStore'
import { computed, ref, watch, nextTick } from 'vue'

const store = useReplayStore()

// 1. 获取当前帧的队列数据（防空指针）
const currentQueues = computed(
  () => store.currentFrame?.queues || { running: [], pending: [], sync_waiting: [] },
)

// 2. 实现“弹幕式”的历史事件累积日志
// 我们不仅想看当前帧发生的事件，还想保留最近发生过的 20 条历史事件
const eventHistory = ref<{ time: number; msg: string }[]>([])
const logContainerRef = ref<HTMLDivElement | null>(null)

// 监听当前帧的变化，如果有新事件，就推入历史记录中
watch(
  () => store.currentFrame,
  async (newFrame) => {
    // 👈 加上 async
    if (newFrame && newFrame.events && newFrame.events.length > 0) {
      newFrame.events.forEach((eventMsg) => {
        eventHistory.value.push({ time: newFrame.timestamp, msg: eventMsg })
      })

      // 放宽限制，保留最近的 100 条日志，让用户可以往上滚动查看
      if (eventHistory.value.length > 100) {
        eventHistory.value.shift()
      }

      // 👇 【核心修复】：使用 await nextTick()，绝对保证每次推入新日志后，精准滚动到底部！
      await nextTick()
      if (logContainerRef.value) {
        logContainerRef.value.scrollTop = logContainerRef.value.scrollHeight
      }
    }
  },
)

// 为了防止用户乱拖进度条导致日志错乱，如果时间倒退了，清空历史日志重新开始记录
watch(
  () => store.currentIndex,
  (newIdx, oldIdx) => {
    if (newIdx < oldIdx) {
      eventHistory.value = []
    }
  },
)
</script>

<template>
  <div class="dashboard-panel">
    <!-- 模块一：全局统计指标 (Global Metrics) -->
    <div class="panel-section metrics-section">
      <h3 class="section-title">Global Metrics</h3>
      <div class="metric-card">
        <span class="label">System Utility</span>
        <span class="value highlight-blue">{{
          store.currentFrame?.system_utility?.toFixed(3) || '0.000'
        }}</span>
      </div>
    </div>

    <!-- 模块二：作业队列监控 (Job Queues) -->
    <div class="panel-section queues-section">
      <h3 class="section-title">Queue Status</h3>

      <div class="queue-item running">
        <div class="queue-info">
          <span class="dot bg-blue-500"></span>
          <span>Running (GPU)</span>
        </div>
        <span class="count">{{ currentQueues.running.length }}</span>
      </div>

      <div class="queue-item pending">
        <div class="queue-info">
          <span class="dot bg-yellow-500"></span>
          <span>Pending (Wait)</span>
        </div>
        <span class="count">{{ currentQueues.pending.length }}</span>
      </div>

      <div class="queue-item waiting">
        <div class="queue-info">
          <span class="dot bg-red-500"></span>
          <span>Sync Waiting (HPO)</span>
        </div>
        <!-- 这里的 sync_waiting 数量会在 30% 屏障时激增！ -->
        <span class="count highlight-red">{{ currentQueues.sync_waiting.length }}</span>
      </div>
    </div>

    <!-- 模块三：实时事件播报终端 (Event Terminal) -->
    <div class="panel-section terminal-section">
      <h3 class="section-title">Event Log</h3>
      <div class="terminal-window" ref="logContainerRef">
        <div v-if="eventHistory.length === 0" class="empty-log">No events yet...</div>

        <!-- 逐条渲染历史事件 -->
        <div
          v-for="(event, idx) in eventHistory"
          :key="idx"
          class="log-entry"
          :class="{ 'highlight-log': event.msg.includes('淘汰') || event.msg.includes('重生') }"
        >
          <span class="log-time">[T: {{ event.time }}s]</span>
          <span class="log-msg">{{ event.msg }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  /* 强行锁死仪表盘的高度，等于视口高度减去头部和底部播放器的高度 (60px + 70px = 130px) */
  height: calc(100vh - 130px);
  padding: 20px;
  background-color: #ffffff;
  border-left: 1px solid #e5e7eb;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.02);
}

.panel-section {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #6b7280;
  margin: 0 0 12px 0;
  letter-spacing: 0.05em;
}

/* 指标卡片与队列条目 (保持不变) */
.metric-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f3f4f6;
  padding: 12px 16px;
  border-radius: 8px;

  .label {
    font-weight: 500;
    color: #4b5563;
  }
  .value {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: monospace;
  }
  .highlight-blue {
    color: #3b82f6;
  }
}

.queue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  background-color: #f9fafb;
  border: 1px solid transparent;
  transition: border-color 0.2s;

  &:hover {
    border-color: #d1d5db;
  }

  .queue-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
  }

  .count {
    font-size: 1.1rem;
    font-weight: 700;
    font-family: monospace;
    color: #111827;
  }

  .highlight-red {
    color: #ef4444;
  }
}

.bg-blue-500 {
  background-color: #3b82f6;
}
.bg-yellow-500 {
  background-color: #eab308;
}
.bg-red-500 {
  background-color: #ef4444;
}

/* ======================================================== */
/* 👇 核心修复区：黑色代码终端的绝对滚动锁定 */
/* ======================================================== */

.terminal-section {
  /* 让终端区域吃满 dashboard-panel 剩下的所有高度！ */
  flex: 1;
  display: flex;
  flex-direction: column;
  /* 极其重要：防止 flex 子项被内容撑开而超出父容器 */
  min-height: 0;
}

.terminal-window {
  /* 让黑框吃满 terminal-section 提供的高度 */
  flex: 1;
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 12px;

  /* 极其重要：开启垂直滚动条，隐藏水平滚动条 */
  overflow-y: auto;
  overflow-x: hidden;

  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);

  /* 自定义滚动条使终端看起来更酷 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #1e1e1e;
  }
  &::-webkit-scrollbar-thumb {
    background: #4b5563;
    border-radius: 3px;
  }
}

.empty-log {
  color: #6b7280;
  font-style: italic;
}

.log-entry {
  margin-bottom: 6px;
  /* 极其重要：强制极长的字符串换行，防止撑出水平滚动条！ */
  word-break: break-all;
  white-space: pre-wrap;
  color: #d4d4d8;

  .log-time {
    color: #10b981; /* 绿色时间戳 */
    margin-right: 8px;
    opacity: 0.8;
  }

  .log-msg {
    color: #e4e4e7;
  }

  &.highlight-log {
    background-color: rgba(239, 68, 68, 0.1);
    border-left: 2px solid #ef4444;
    padding-left: 6px;
    .log-msg {
      color: #fca5a5;
      font-weight: bold;
    }
  }
}
</style>
