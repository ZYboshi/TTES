// 描述单个 GPU 的状态（比如 "free" 或者 "job_0"）
export type GpuStatus = string

// 描述单个物理节点（8张卡）
export interface ClusterNode {
  node_id: number
  gpus: GpuStatus[]
}

// 描述挂起/等待队列
export interface JobQueues {
  running: number[]
  pending: number[]
  sync_waiting: number[]
}

// 描述任务详细信息（供悬浮提示使用）
export interface JobInfo {
  mem_id: string
  group: string
  progress: number
  target: number
  status: string
}

// 描述时间轴上的一帧快照（也就是 replay.json 数组里的一个对象）
export interface ReplayFrame {
  timestamp: number
  cluster_state: ClusterNode[]
  queues: JobQueues
  jobs_info: Record<string, JobInfo>
  system_utility: number
}
