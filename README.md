# Claude Skyline

A real-time 3D visualization of Claude Code activity, rendered as a cyberpunk city skyline using Three.js.

![Claude Skyline](https://img.shields.io/badge/Three.js-black?style=flat&logo=three.js)



https://github.com/user-attachments/assets/c3a21c80-6f74-4d42-8eb5-82317d3cf800



## Features

- **Session Buildings**: Each Claude Code instance gets its own skyscraper that grows taller as context accumulates
- **Agent Buildings**: Task tool spawns create smaller buildings that rise from the ground with dramatic animations
- **File Buildings**: Files that are read/written appear as satellite buildings connected to their parent session by green lines
- **Data Traffic**: Animated cars travel between buildings representing tool calls and responses
- **Neon Sign**: "CLAUDE CODE" pixel sign with flickering effect in the background
- **Dark Green City**: Ground with subtle green grid overlay
- **Real-time Stats**: Track tools used, context size, success rate, and active buildings
- **Compaction Support**: Buildings shrink when you run `/compact` in Claude Code

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/calumjs/Claude_Skyline.git
cd Claude_Skyline
npm install
```

### 2. Configure Claude Code Hooks

Add the following to your Claude Code settings file:

**Windows**: `%USERPROFILE%\.claude\settings.json`
**Mac/Linux**: `~/.claude/settings.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/Claude_Skyline/hooks/claude-hook.js",
            "timeout": 5
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/Claude_Skyline/hooks/claude-hook.js",
            "timeout": 5
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/Claude_Skyline/hooks/claude-hook.js",
            "timeout": 5
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/Claude_Skyline/hooks/claude-hook.js",
            "timeout": 5
          }
        ]
      }
    ],
    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/Claude_Skyline/hooks/claude-hook.js",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

**Important**: Replace `/path/to/Claude_Skyline` with the actual path to where you cloned this repo.

### 3. Start the Server

```bash
npm start
```

Or directly:

```bash
node server.js
```

### 4. Open the Visualization

Navigate to [http://localhost:4242](http://localhost:4242) in your browser.

### 5. Use Claude Code

Start using Claude Code in any terminal. The visualization will update in real-time as you interact with Claude.

## Controls

- **Left-click + drag**: Rotate camera
- **Right-click + drag**: Pan camera
- **Scroll**: Zoom in/out

## Architecture

```
Claude_Skyline/
├── server.js           # WebSocket server that receives hook events
├── hooks/
│   └── claude-hook.js  # Hook script that captures Claude Code events
└── public/
    └── index.html      # Three.js visualization
```

## How It Works

1. Claude Code hooks capture events (tool calls, prompts, etc.)
2. The hook script POSTs events to the local server
3. Server broadcasts events via WebSocket to connected browsers
4. Three.js visualization creates/updates buildings and animations

## Building Types

| Building | Color | Represents |
|----------|-------|------------|
| Main Tower | Orange accent | Claude Code session |
| Agent Building | Purple burst | Task tool agents |
| File Building | Green accent + connection line | Files read/written |

## Event Types

- `tool_start` / `tool_end`: Tool calls with traffic animations
- `prompt`: User input events
- `compact`: Context compaction (buildings shrink)
- `stop`: Session/agent completion

## License

MIT
