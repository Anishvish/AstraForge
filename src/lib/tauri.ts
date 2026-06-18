import { invoke } from '@tauri-apps/api/core';
import { listen, emit } from '@tauri-apps/api/event';
import type { UnlistenFn } from '@tauri-apps/api/event';

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  is_file: boolean;
  size: number;
  modified: number;
  extension: string | null;
}

export interface FileTreeNode {
  name: string;
  path: string;
  is_dir: boolean;
  children: FileTreeNode[];
  is_file: boolean;
  size: number;
  extension: string | null;
}

export interface SearchResult {
  path: string;
  line_number: number;
  line_content: string;
  match_start: number;
  match_end: number;
}

export interface GitStatus {
  is_repo: boolean;
  branch: string;
  staged: GitFileChange[];
  unstaged: GitFileChange[];
  untracked: string[];
  ahead: number;
  behind: number;
}

export interface GitFileChange {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'copied' | 'untracked';
  old_path: string | null;
}

export interface GitCommit {
  hash: string;
  short_hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
}

export interface GitBranch {
  name: string;
  is_current: boolean;
  is_remote: boolean;
  upstream: string | null;
  last_commit: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model_id: string | null;
  tokens_used: number | null;
}

export interface AiResponse {
  content: string;
  model: string;
  tokens_used: number;
  finish_reason: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  context_length: number;
  description: string | null;
}

export interface ProviderConfig {
  id: string;
  name: string;
  provider_type: 'nvidia' | 'ollama' | 'openrouter' | 'lmstudio' | 'custom';
  base_url: string;
  api_key: string | null;
  is_enabled: boolean;
  models: ModelInfo[];
}

export interface AgentTask {
  id: string;
  title: string;
  agent_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  started_at: number | null;
  completed_at: number | null;
  result: string | null;
  error: string | null;
  actions: AgentAction[];
}

export interface AgentAction {
  id: string;
  action_type: string;
  description: string;
  timestamp: number;
  duration_ms: number | null;
  status: 'success' | 'error' | 'running' | 'pending';
  input: string | null;
  output: string | null;
}

export interface Memory {
  id: string;
  content: string;
  memory_type: string;
  tags: string[];
  created_at: number;
  relevance_score: number | null;
}

export interface Checkpoint {
  id: string;
  name: string;
  description: string;
  created_at: number;
  file_count: number;
  size_bytes: number;
}

export interface CommandOutput {
  stdout: string;
  stderr: string;
  exit_code: number;
  success: boolean;
}

export interface TerminalSessionInfo {
  id: string;
  name: string;
  is_active: boolean;
}

// ─── File Operations ─────────────────────────────────────────────────────────

export async function readFileContent(path: string): Promise<string> {
  return invoke<string>('read_file_content', { path });
}

export async function writeFileContent(path: string, content: string): Promise<void> {
  return invoke<void>('write_file_content', { path, content });
}

export async function createFile(path: string, content?: string): Promise<void> {
  return invoke<void>('create_file', { path, content: content ?? '' });
}

export async function createDirectory(path: string): Promise<void> {
  return invoke<void>('create_directory', { path });
}

export async function deletePath(path: string): Promise<void> {
  return invoke<void>('delete_path', { path });
}

export async function renamePath(oldPath: string, newPath: string): Promise<void> {
  return invoke<void>('rename_path', { oldPath, newPath });
}

export async function listDirectory(path: string): Promise<FileEntry[]> {
  return invoke<FileEntry[]>('list_directory', { path });
}

export async function getFileTree(path: string): Promise<FileTreeNode> {
  return invoke<FileTreeNode>('get_file_tree', { path });
}

export async function searchFiles(
  projectPath: string,
  query: string,
  caseSensitive?: boolean,
  wholeWord?: boolean,
  isRegex?: boolean,
): Promise<SearchResult[]> {
  return invoke<SearchResult[]>('search_files', {
    projectPath,
    query,
    caseSensitive: caseSensitive ?? false,
    wholeWord: wholeWord ?? false,
    isRegex: isRegex ?? false,
  });
}

// ─── Git Operations ──────────────────────────────────────────────────────────

export async function gitInit(path: string): Promise<void> {
  return invoke<void>('git_init', { path });
}

export async function gitStatus(path: string): Promise<GitStatus> {
  return invoke<GitStatus>('git_status', { path });
}

export async function gitDiff(path: string, filePath?: string): Promise<string> {
  return invoke<string>('git_diff', { path, filePath: filePath ?? null });
}

export async function gitStage(path: string, files: string[]): Promise<void> {
  return invoke<void>('git_stage', { path, files });
}

export async function gitUnstage(path: string, files: string[]): Promise<void> {
  return invoke<void>('git_unstage', { path, files });
}

export async function gitCommit(path: string, message: string): Promise<string> {
  return invoke<string>('git_commit', { path, message });
}

export async function gitLog(path: string, limit?: number): Promise<GitCommit[]> {
  return invoke<GitCommit[]>('git_log', { path, limit: limit ?? 50 });
}

export async function gitBranches(path: string): Promise<GitBranch[]> {
  return invoke<GitBranch[]>('git_branches', { path });
}

export async function gitCheckout(path: string, branch: string): Promise<void> {
  return invoke<void>('git_checkout', { path, branch });
}

export async function gitCreateBranch(path: string, name: string): Promise<void> {
  return invoke<void>('git_create_branch', { path, name });
}

export async function gitCurrentBranch(path: string): Promise<string> {
  return invoke<string>('git_current_branch', { path });
}

// ─── Terminal Operations ─────────────────────────────────────────────────────

export async function createTerminalSession(cwd?: string): Promise<string> {
  return invoke<string>('create_terminal_session', { cwd: cwd ?? null });
}

export async function writeToTerminal(sessionId: string, data: string): Promise<void> {
  return invoke<void>('write_to_terminal', { sessionId, data });
}

export async function closeTerminal(sessionId: string): Promise<void> {
  return invoke<void>('close_terminal', { sessionId });
}

export async function runCommand(command: string, cwd?: string): Promise<CommandOutput> {
  return invoke<CommandOutput>('run_command', { command, cwd: cwd ?? null });
}

// ─── AI Operations ───────────────────────────────────────────────────────────

export async function aiChat(
  messages: ChatMessage[],
  modelId: string,
  providerId: string,
): Promise<AiResponse> {
  return invoke<AiResponse>('ai_chat', { messages, modelId, providerId });
}

export async function aiStreamChat(
  messages: ChatMessage[],
  modelId: string,
  providerId: string,
): Promise<string> {
  return invoke<string>('ai_stream_chat', { messages, modelId, providerId });
}

export async function aiListModels(providerId: string): Promise<ModelInfo[]> {
  return invoke<ModelInfo[]>('ai_list_models', { providerId });
}

export async function aiTestConnection(providerId: string): Promise<boolean> {
  return invoke<boolean>('ai_test_connection', { providerId });
}

export async function saveProviderConfig(config: ProviderConfig): Promise<void> {
  return invoke<void>('save_provider_config', { config });
}

export async function getProviderConfigs(): Promise<ProviderConfig[]> {
  return invoke<ProviderConfig[]>('get_provider_configs');
}

export async function saveApiKey(providerId: string, apiKey: string): Promise<void> {
  return invoke<void>('save_api_key', { providerId, apiKey });
}

// ─── Agent Operations ────────────────────────────────────────────────────────

export async function startAgentTask(
  taskType: string,
  prompt: string,
  projectPath: string,
): Promise<string> {
  return invoke<string>('start_agent_task', { taskType, prompt, projectPath });
}

export async function stopAgentTask(taskId: string): Promise<void> {
  return invoke<void>('stop_agent_task', { taskId });
}

export async function getAgentStatus(taskId: string): Promise<AgentTask> {
  return invoke<AgentTask>('get_agent_status', { taskId });
}

export async function getAgentHistory(): Promise<AgentTask[]> {
  return invoke<AgentTask[]>('get_agent_history');
}

// ─── Memory Operations ──────────────────────────────────────────────────────

export async function storeMemory(
  content: string,
  memoryType: string,
  tags: string[],
): Promise<string> {
  return invoke<string>('store_memory', { content, memoryType, tags });
}

export async function recallMemories(
  query: string,
  limit?: number,
): Promise<Memory[]> {
  return invoke<Memory[]>('recall_memories', { query, limit: limit ?? 10 });
}

export async function deleteMemory(id: string): Promise<void> {
  return invoke<void>('delete_memory', { id });
}

// ─── Settings Operations ─────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  return invoke<string | null>('get_setting', { key });
}

export async function setSetting(key: string, value: string): Promise<void> {
  return invoke<void>('set_setting', { key, value });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  return invoke<Record<string, string>>('get_all_settings');
}

// ─── Checkpoint Operations ───────────────────────────────────────────────────

export async function createCheckpoint(
  name: string,
  description: string,
  projectPath: string,
): Promise<string> {
  return invoke<string>('create_checkpoint', { name, description, projectPath });
}

export async function listCheckpoints(projectPath: string): Promise<Checkpoint[]> {
  return invoke<Checkpoint[]>('list_checkpoints', { projectPath });
}

export async function restoreCheckpoint(
  checkpointId: string,
  projectPath: string,
): Promise<void> {
  return invoke<void>('restore_checkpoint', { checkpointId, projectPath });
}

export interface RAGSearchResult {
  file_path: string;
  start_line: number;
  end_line: number;
  content: string;
  relevance_score: number;
}

export async function semanticSearch(
  query: string,
  limit?: number,
): Promise<RAGSearchResult[]> {
  return invoke<RAGSearchResult[]>('semantic_search', { query, limit: limit ?? 5 });
}

export interface HealingResult {
  success: boolean;
  original_error: string;
  fixed_code: string | null;
  file_path: string | null;
}

export async function runSelfHealingBuild(
  command: string,
  args: string[],
): Promise<HealingResult> {
  return invoke<HealingResult>('run_self_healing_build', { command, args });
}

export interface ReviewFinding {
  line_number: number;
  severity: 'info' | 'warning' | 'critical';
  category: 'security' | 'bug' | 'performance' | 'style';
  message: string;
  suggestion: string;
}

export async function reviewCode(
  code: string,
  fileName: string,
): Promise<ReviewFinding[]> {
  return invoke<ReviewFinding[]>('review_code', { code, fileName });
}




// ─── Event Listeners ─────────────────────────────────────────────────────────

export function onTerminalOutput(
  callback: (data: { sessionId: string; data: string }) => void,
): Promise<UnlistenFn> {
  return listen<{ sessionId: string; data: string }>('terminal-output', (event) => {
    callback(event.payload);
  });
}

export function onAiStreamChunk(
  callback: (data: { chunk: string; done: boolean }) => void,
): Promise<UnlistenFn> {
  return listen<{ chunk: string; done: boolean }>('ai-stream-chunk', (event) => {
    callback(event.payload);
  });
}

export function onAgentUpdate(
  callback: (data: AgentTask) => void,
): Promise<UnlistenFn> {
  return listen<AgentTask>('agent-update', (event) => {
    callback(event.payload);
  });
}

export function onFileChanged(
  callback: (data: { path: string; kind: string }) => void,
): Promise<UnlistenFn> {
  return listen<{ path: string; kind: string }>('file-changed', (event) => {
    callback(event.payload);
  });
}

export function emitEvent(event: string, payload?: unknown): Promise<void> {
  return emit(event, payload);
}
