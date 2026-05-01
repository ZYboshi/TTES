# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

TTES is a GPU cluster scheduling replay visualizer. It reads a `replay.json` file exported from a Python backend and renders the cluster state as an animated timeline — showing job queues, GPU allocation, and node status over time.

## Development Commands

```sh
npm install          # Install dependencies
npm run dev         # Start dev server with hot reload
npm run build       # Type-check, compile and minify for production
npm run lint        # Run ESLint and Oxlint with auto-fix
npm run format      # Format code with Prettier
npm run type-check  # Run vue-tsc for type checking
```

## Architecture

```
TTES/
├── public/
│   └── replay.json          # Backend-exported replay data (drop here)
├── src/
│   ├── assets/styles/
│   │   ├── variables.scss   # GPU colors, state colors (SCSS vars)
│   │   └── main.scss        # Global base styles
│   ├── components/
│   │   ├── cluster/
│   │   │   ├── ClusterView.vue  # 128-node grid container (CSS Grid)
│   │   │   └── NodeBox.vue      # Single node: 8 GPU squares with color
│   │   ├── control/
│   │   │   └── PlayerBar.vue    # Bottom player: play/pause, timeline slider, speed
│   │   └── dashboard/
│   │       ├── QueuePanel.vue   # Right sidebar: waiting/pending queue stats
│   │       └── JobTooltip.vue   # Hover tooltip on GPU with job details
│   ├── stores/
│   │   └── replayStore.ts   # Core: timeline logic, playback, frame calculation
│   ├── types/
│   │   └── replay.d.ts      # TS interfaces for replay.json structure
│   ├── App.vue              # Three-column layout structure
│   └── main.ts              # Vue mount entry (Pinia + Router)
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Core Concepts

- **Data First**: `types/replay.d.ts` defines the replay.json schema before any component logic. This gives full TS autocomplete for the entire JSON structure.
- **Store Logic**: `replayStore.ts` is the brain — all timer/playback/frame-seeking logic lives here. Components only read `store.currentFrame`.
- **Component Simplicity**: `ClusterView` renders a CSS Grid. `NodeBox` takes a `gpus` array and fills 8 squares with state colors. `PlayerBar` controls `replayStore`.

## State Management (Pinia)

`replayStore.ts` handles:
- `currentFrame` — the active frame index on the timeline
- `isPlaying` / `play()` / `pause()` — playback control
- Speed adjustment and timeline seeking
- Queue statistics computation from frame data

## TypeScript Notes

- `noUncheckedIndexedAccess` enabled in `tsconfig.app.json`
- `@` alias maps to `./src/`
- `.vue` files require `vue-tsc` for type checking (not plain `tsc`)
- Volar provides IDE support for `.vue` type info

## Linting

- ESLint 10 + Oxlint 1 + Prettier 3
- `.oxlintrc.json` sets correctness rules to error
- `npm run lint` runs both `oxlint` and `eslint` with `--fix`
