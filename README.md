# TTES

## TTES工程目录

TTES/
├── public/
│ ├── favicon.ico
│ └── replay.json <-- 🎯 你的后端导出的剧本文件直接扔在这里
├── src/
│ ├── assets/
│ │ └── styles/
│ │ ├── variables.scss <-- SCSS 变量（定义 GPU 颜色、状态颜色等）
│ │ └── main.scss <-- 全局基础样式
│ ├── components/ <-- 🧩 模块化组件库
│ │ ├── cluster/
│ │ │ ├── ClusterView.vue <-- 集群矩阵容器 (渲染 128 个节点)
│ │ │ └── NodeBox.vue <-- 单个节点组件 (画 8 个 GPU 小方块)
│ │ ├── control/
│ │ │ └── PlayerBar.vue <-- 底部播放器 (播放/暂停/时间轴滑块/倍速)
│ │ └── dashboard/
│ │ ├── QueuePanel.vue <-- 右侧栏：等待队列、挂起队列统计
│ │ └── JobTooltip.vue <-- 鼠标悬浮在 GPU 上时显示的任务详情卡片
│ ├── stores/
│ │ └── replayStore.ts <-- 🧠 Pinia 状态管理（核心！控制时间轴和当前帧计算）
│ ├── types/
│ │ └── replay.d.ts <-- 🏷️ TS 类型声明（严格定义 replay.json 的数据接口）
│ ├── App.vue <-- 整体三栏式布局结构
│ └── main.ts <-- Vue 挂载入口
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts

类型先行 (types/replay.d.ts)：
因为你用了 TS，我们会先把刚才 Python 导出的 JSON 结构定义成 TS Interface。这样在写组件时，任何属性（比如 node.gpus）都会有完美的智能代码补全，绝不会写错拼写。
逻辑抽离 (stores/replayStore.ts)：
前端最复杂的“上一帧、下一帧、自动播放、改变播放速度”等定时器逻辑，全部封装在这里。组件只通过 store.currentFrame 来拿当前时间的画面数据，干干净净。
极简组件化 (components/)：
ClusterView 只负责用 CSS Grid 画出网格。
NodeBox 只负责根据传入的 gpus 数组，给自己的 8 个方块填上 SCSS 对应的颜色。

## 搭建步骤：

我们分三步走：先搭数据核心 -> 再画控制台 -> 最后画集群动画。

### 1. 搭建播放器大脑（Pinia + TS）

定义数据类型（TypeScript）
在 src 目录下新建 types 文件夹，并在里面创建 replay.d.ts。这个文件严格描述了你 Python 导出的 JSON 结构，能在你后续写 Vue 时提供强大的代码补全和类型检查。

### 2. 创建播放器控制器（Pinia Store）

在 src 目录下新建 stores 文件夹，并在里面创建 replayStore.ts。这里封装了所有的定时器、播放、暂停和时间轴拖拽逻辑。

### 3. 注册 Pinia 并进行 Debug 测试

为了测试刚才写的大脑是否正常工作，我们需要在主入口文件里挂载 Pinia，并在 App.vue 里写一个极其简单的按钮来调用它

### 修改 src/App.vue（用于纯净的逻辑 Debug）
