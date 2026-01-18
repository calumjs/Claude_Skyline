#!/usr/bin/env node
/**
 * Claude Code Hook - Captures events and sends to visualization server
 *
 * Reads hook input from stdin, transforms it, and:
 * 1. Appends to local JSONL file
 * 2. POSTs to local WebSocket server
 */

import { readFileSync, appendFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { homedir } from 'os';
import http from 'http';

// Configuration
const DATA_DIR = join(homedir(), '.claude-viz');
const EVENTS_FILE = join(DATA_DIR, 'events.jsonl');
const SERVER_URL = 'http://localhost:4242/event';

// Ensure data directory exists
try {
  mkdirSync(DATA_DIR, { recursive: true });
} catch (e) {}

// Read stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const event = transformEvent(data);

    // Write to file
    appendFileSync(EVENTS_FILE, JSON.stringify(event) + '\n');

    // Send to server (fire and forget)
    sendToServer(event);
  } catch (e) {
    // Silent fail - don't break Claude
  }
});

function transformEvent(data) {
  const timestamp = Date.now();
  const baseEvent = {
    id: `${data.session_id}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp,
    sessionId: data.session_id || 'unknown',
    cwd: data.cwd || '',
    hookType: data.hook_event_name || 'unknown'
  };

  switch (data.hook_event_name) {
    case 'PreToolUse':
      return {
        ...baseEvent,
        type: 'tool_start',
        tool: data.tool_name || 'unknown',
        toolInput: summarizeInput(data.tool_input)
      };

    case 'PostToolUse':
      return {
        ...baseEvent,
        type: 'tool_end',
        tool: data.tool_name || 'unknown',
        success: data.tool_response?.success !== false,
        duration: data.tool_response?.duration_ms
      };

    case 'UserPromptSubmit':
      return {
        ...baseEvent,
        type: 'prompt',
        promptLength: (data.prompt || '').length,
        promptPreview: (data.prompt || '').slice(0, 100)
      };

    case 'Stop':
    case 'SubagentStop':
      return {
        ...baseEvent,
        type: 'stop',
        isSubagent: data.hook_event_name === 'SubagentStop'
      };

    case 'Notification':
      return {
        ...baseEvent,
        type: 'notification',
        message: data.message
      };

    case 'PreCompact':
      return {
        ...baseEvent,
        type: 'compact',
        trigger: data.trigger || 'unknown'
      };

    default:
      return {
        ...baseEvent,
        type: 'other'
      };
  }
}

function summarizeInput(input) {
  if (!input) return {};

  // Extract key info without full content
  const summary = {};
  if (input.file_path) summary.file_path = input.file_path;
  if (input.command) summary.command = input.command.slice(0, 50);
  if (input.pattern) summary.pattern = input.pattern;
  if (input.query) summary.query = input.query.slice(0, 50);
  if (input.url) summary.url = input.url;
  if (input.prompt) summary.prompt = input.prompt.slice(0, 50);
  // Task/agent specific fields
  if (input.subagent_type) summary.subagent_type = input.subagent_type;
  if (input.description) summary.description = input.description;

  return summary;
}

function sendToServer(event) {
  const data = JSON.stringify(event);
  const url = new URL(SERVER_URL);

  const req = http.request({
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    },
    timeout: 2000
  });

  req.on('error', () => {}); // Silent fail
  req.write(data);
  req.end();
}
