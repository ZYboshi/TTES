import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ReplayFrame, ReplayMeta, JobInfo, ReplayRoot } from '../types/replay'

export const useReplayStore = defineStore('replay', () => {
  // 1. 核心响应式数据 (拆分存放 JSON 的三大部分)
  const meta = ref<ReplayMeta | null>(null)
  const jobInfoDict = ref<Record<string, JobInfo>>({})
  const frames = ref<ReplayFrame[]>([])

  // 2. 播放状态
  const currentIndex = ref(0)
  const isPlaying = ref(false)
  const playbackSpeed = ref(500) // 每帧停留 500ms
  let timer: ReturnType<typeof setInterval> | null = null

  // 3. 派生状态：当前帧画面
  const currentFrame = computed(() => {
    if (frames.value.length === 0) return null
    return frames.value[currentIndex.value]
  })

  // 派生状态：总帧数
  const totalFrames = computed(() => frames.value.length)
  // 👇 【新增】：记录高能书签的帧索引
  const bookmarks = ref<number[]>([])
  // 4. 动作方法：加载全新的 JSON 数据结构
  const loadReplayData = async () => {
    try {
      console.log('🔄 开始加载瘦身版 replay.json...')
      const response = await fetch('/replay.json')
      const data: ReplayRoot = await response.json() // 必须加上类型断言

      // 分别赋值
      meta.value = data.meta
      jobInfoDict.value = data.job_info
      frames.value = data.frames
      // ====================================================================
      // 👇 【新增】：人工造一个极其干净的“第 0 帧”，让观众有一个启动的仪式感
      if (frames.value.length > 0) {
        const firstFrameTime = frames.value[0]!.timestamp
        // 构造一个在第一个真实事件发生前 1 秒的纯净状态
        const blankFrame: ReplayFrame = {
          timestamp: firstFrameTime - 1,
          events: ['💤 系统启动，集群处于完全空闲状态，等待任务调度...'],
          cluster_state: {}, // 空字典代表所有节点全空
          queues: { running: [], pending: [], sync_waiting: [] },
          system_utility: 0.0,
        }
        // 把这个空白帧强行塞到数组最前面
        frames.value.unshift(blankFrame)
      }
      // ====================================================================
      currentIndex.value = 0
      // 👇 【新增】：预扫描所有的帧，提取高能书签
      const bookmarkIndices: number[] = []
      data.frames.forEach((frame, index) => {
        if (frame.events && frame.events.length > 0) {
          // 如果该帧的事件日志中包含了“审判”或“淘汰”的关键字，就记下这一帧的下标
          const isHighEnergy = frame.events.some((e) => e.includes('审判') || e.includes('淘汰'))
          if (isHighEnergy) {
            bookmarkIndices.push(index)
          }
        }
      })
      bookmarks.value = bookmarkIndices // 保存到 state 中
      // 👆 新增结束
      console.log(
        `✅ 加载成功！集群规模: ${meta.value?.total_nodes} 节点, 总计 ${data.frames.length} 帧快照。`,
      )
    } catch (error) {
      console.error('❌ 加载 replay.json 失败，请检查 public 目录下:', error)
    }
  }

  // 5. 播放器控制 (和原来一样)
  const play = () => {
    if (frames.value.length === 0) return
    if (currentIndex.value >= frames.value.length - 1) {
      currentIndex.value = 0
    }

    isPlaying.value = true
    timer = setInterval(() => {
      if (currentIndex.value < frames.value.length - 1) {
        currentIndex.value++
      } else {
        pause()
      }
    }, playbackSpeed.value)
  }

  const pause = () => {
    isPlaying.value = false
    if (timer) clearInterval(timer)
  }

  const setFrame = (index: number) => {
    if (index >= 0 && index < frames.value.length) {
      currentIndex.value = index
    }
  }

  return {
    meta,
    jobInfoDict,
    frames,
    currentIndex,
    currentFrame,
    totalFrames,
    isPlaying,
    bookmarks,
    loadReplayData,
    play,
    pause,
    setFrame,
  }
})
