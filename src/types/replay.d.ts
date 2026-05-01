// 1. 全局静态元数据
export interface ReplayMeta {
  total_nodes: number
  gpus_per_node: number
}

// 2. 任务静态详情 (字典：Job ID -> 详情)
export interface JobInfo {
  group: string
  member_id: string
  target_ratio: number
}

// 3. 动态挂起/排队队列
export interface JobQueues {
  running: number[]
  pending: number[]
  sync_waiting: number[]
}

// 4. 核心：单帧快照
export interface ReplayFrame {
  timestamp: number
  events: string[]
  // 稀疏字典：只记录有任务的 Node。Key 是 node_id 字符串，Value 是 8 个整数（Job ID）
  // 按照你的设计，0 代表被占用，如果没有这个 Key，说明整个节点都是 Free 的。
  cluster_state: Record<string, number[]>
  queues: JobQueues
  system_utility: number
}

// 5. 整个 replay.json 的根结构
export interface ReplayRoot {
  meta: ReplayMeta
  job_info: Record<string, JobInfo>
  frames: ReplayFrame[]
}
