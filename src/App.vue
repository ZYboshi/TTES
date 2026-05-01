<script setup lang="ts">
import { onMounted } from 'vue'
import { useReplayStore } from './stores/replayStore'
import ClusterView from './components/cluster/ClusterView.vue'
import DashboardPanel from './components/dashboard/DashboardPanel.vue'

const store = useReplayStore()

onMounted(() => {
  store.loadReplayData()
})
</script>

<template>
  <div class="app-layout">
    <!-- 头部区域 -->
    <header class="app-header">
      <h1>TTES: Trace-driven Tiered Early-Stopping Simulator</h1>
      <!-- 顶部时间与 Utility 监控 -->
      <div class="stats" v-if="store.currentFrame">
        <span class="time-badge"
          >Time: <b>{{ store.currentFrame.timestamp }}</b> s</span
        >
        <span class="util-badge"
          >Utility: <b>{{ store.currentFrame.system_utility }}</b></span
        >
      </div>
    </header>

    <!-- 中间大盘区：左右分栏 -->
    <main class="main-content">
      <!-- 左侧：集群视图占据 75% 宽度 -->
      <div class="left-pane">
        <ClusterView />
      </div>

      <!-- 右侧：仪表盘占据 25% 宽度 -->
      <div class="right-pane">
        <DashboardPanel />
      </div>
    </main>

    <!-- 底部播放器 -->
    <footer class="player-bar">
      <button class="control-btn" @click="store.isPlaying ? store.pause() : store.play()">
        {{ store.isPlaying ? '⏸️ 暂停' : '▶️ 播放' }}
      </button>

      <!-- 进度条与红点容器 -->
      <div class="slider-container">
        <!-- 遍历 bookmarks 数组，生成高能书签小红点 -->
        <div
          v-for="markIndex in store.bookmarks"
          :key="'mark_' + markIndex"
          class="bookmark-dot"
          :style="{
            left: `calc(${(markIndex / Math.max(1, store.totalFrames - 1)) * 100}% + 4px)`,
          }"
          title="🔥 高能审判发生点！点击空降"
          @click="store.setFrame(markIndex)"
        ></div>

        <!-- 原始滑动条 -->
        <input
          type="range"
          class="time-slider"
          :min="0"
          :max="Math.max(0, store.totalFrames - 1)"
          :value="store.currentIndex"
          @input="(e) => store.setFrame(Number((e.target as HTMLInputElement).value))"
        />
      </div>

      <span class="frame-counter">
        Frame: {{ store.currentIndex }} / {{ Math.max(0, store.totalFrames - 1) }}
      </span>
    </footer>
  </div>
</template>

<style lang="scss">
/* 全局基础重置 */
body {
  margin: 0;
  padding: 0;
  background-color: #f3f4f6;
  font-family: 'Inter', sans-serif;
}

.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* ================= 头部样式 ================= */
.app-header {
  height: 60px;
  background-color: #111827;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;

  h1 {
    font-size: 1.25rem;
    margin: 0;
    letter-spacing: 0.05em;
  }

  .stats {
    display: flex;
    gap: 16px;

    span {
      background-color: rgba(255, 255, 255, 0.1);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.9rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    b {
      color: #60a5fa;
      font-family: monospace;
      font-size: 1.1rem;
    }
  }
}

/* ================= 主体左右分栏 ================= */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.left-pane {
  flex: 3;
  overflow-y: auto;
  padding: 20px;
}

.right-pane {
  flex: 1;
  min-width: 320px;
  max-width: 400px;
  background-color: #fff;
  z-index: 10;
}

/* ================= 底部播放器与小红点 ================= */
.player-bar {
  height: 70px;
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 30px;
  gap: 20px;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);

  .control-btn {
    padding: 8px 24px;
    font-size: 1rem;
    font-weight: bold;
    color: white;
    background-color: #3b82f6;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #2563eb;
    }
  }

  /* 进度条外层容器：相对定位 */
  .slider-container {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;
  }

  /* 原始滑动条 */
  .time-slider {
    width: 100%;
    cursor: pointer;
    z-index: 2;
  }

  /* 👇 高能书签小红点样式 */
  .bookmark-dot {
    position: absolute;
    top: 50%;
    /* 往上偏移 15px，让红点悬浮在滑块正上方 */
    transform: translate(-50%, -18px);
    width: 8px;
    height: 8px;
    background-color: #ef4444; /* 鲜艳的死神红 */
    border-radius: 50%;
    cursor: pointer;
    z-index: 3;
    box-shadow: 0 0 6px rgba(239, 68, 68, 0.8);
    transition: all 0.2s ease;

    &:hover {
      transform: translate(-50%, -18px) scale(1.8); /* 鼠标悬浮放大 */
      background-color: #fca5a5;
    }
  }

  .frame-counter {
    font-family: monospace;
    font-weight: 600;
    color: #4b5563;
    min-width: 120px;
    text-align: right;
  }
}
</style>
