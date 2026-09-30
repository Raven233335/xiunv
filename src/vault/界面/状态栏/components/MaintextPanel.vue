<template>
  <div class="maintext-panel" :class="{ 'opts-open': optionsOpen && options.length }">
    <!-- 头部 + 工具栏 -->
    <div class="mt-head">
      <div class="mt-info">
        <span class="mt-dot"></span>
        <span class="mt-location">{{ store.data.世界.当前地点 }}</span>
        <span class="mt-time">{{ store.data.世界.当前时间 }}</span>
        <span class="mt-fog">淫雾 {{ store.data.世界.当前淫雾浓度 }}</span>
      </div>
      <div class="toolbar">
        <button
          class="tool-btn"
          :class="{ active: recruitOpen }"
          :disabled="!canRecruit"
          :title="canRecruit ? '招募' : '仅后方城市可招募'"
          @click="recruitOpen = true"
        >
          <span v-html="ICONS.recruit"></span>
        </button>
        <button class="tool-btn" :class="{ active: readingMode }" title="阅读模式" @click="toggleReading">
          <span v-html="ICONS.reading"></span>
        </button>
        <button class="tool-btn" title="读档" @click="openLoad">
          <span v-html="ICONS.save"></span>
        </button>
        <button class="tool-btn" :class="{ active: isFullscreen }" title="全屏" @click="toggleFullscreen">
          <span v-html="ICONS.fullscreen"></span>
        </button>
      </div>
    </div>

    <!-- 阅读模式 -->
    <div v-if="readingMode" class="reading-mode">
      <div class="reading-head">
        <span class="reading-title">阅读模式</span>
        <span class="reading-count">共 {{ floors.length }} 段</span>
      </div>
      <div class="reading-list">
        <div v-for="f in floors" :key="f.message_id" class="reading-item">
          <div class="reading-floor">第 {{ f.message_id }} 楼</div>
          <div class="reading-text">{{ f.maintext }}</div>
        </div>
        <div v-if="!floors.length" class="reading-empty">暂无正文记录。</div>
      </div>
    </div>

    <!-- 普通模式 -->
    <template v-else>
      <div
        class="mt-body"
        :class="{ 'is-empty': !maintext, longpressable: currentMessageInfo.messageId !== undefined }"
        title="长按可重roll / 编辑正文"
        @mousedown.prevent="onMouseDown"
        @mouseup="endLongPress"
        @mouseleave="endLongPress"
        @touchstart.passive="onTouchStart"
        @touchend="endLongPress"
        @touchcancel="endLongPress"
      >
        <template v-if="maintext">{{ maintext }}</template>
        <template v-else>灰雾尚未散去，等待下一段故事……</template>
      </div>

      <!-- 生成中 / 流式 -->
      <div v-if="sending" class="generating" :class="{ streaming: streamingMaintext }">
        <div v-if="streamingMaintext" class="streaming-text">{{ streamingMaintext }}<span class="typing-cursor"></span></div>
        <template v-else>
          <span class="gen-ring"></span>
          <span class="gen-text">灰雾翻涌，命运正在落笔……</span>
        </template>
      </div>

      <!-- 选项：点击弹出/隐藏 -->
      <div v-else-if="options.length" class="options-wrap">
        <button class="options-toggle" @click="optionsOpen = !optionsOpen">
          <span class="toggle-icon" :class="{ open: optionsOpen }" v-html="ICONS.chevron"></span>
          <span class="toggle-label">抉择</span>
          <span class="toggle-badge">{{ options.length }}</span>
        </button>
        <transition name="collapse">
          <div v-if="optionsOpen" class="options">
            <button
              v-for="(opt, i) in options"
              :key="`${tick}-${i}`"
              class="option"
              :style="{ '--d': `${i * 70}ms` }"
              @click="choose(opt)"
            >
              <span class="option-badge">{{ LETTERS[i] }}</span>
              <span class="option-text">{{ opt }}</span>
              <span class="option-arrow" v-html="ICONS.arrow"></span>
            </button>
          </div>
        </transition>
      </div>

      <!-- 自定义输入框 -->
      <div class="composer">
        <input
          v-model="input"
          class="composer-input"
          placeholder="输入你的行动，或选择上方选项…"
          :disabled="sending"
          @keydown.enter="submit"
        />
        <button class="composer-send" :disabled="sending || !input.trim()" aria-label="发送" @click="submit">
          <span v-html="ICONS.send"></span>
        </button>
      </div>
    </template>

    <!-- 读档弹窗 -->
    <div v-if="loadOpen" class="load-overlay" @click.self="loadOpen = false">
      <div class="load-panel">
        <div class="load-head">
          <span class="load-title">读档 · 回到过去</span>
          <button class="load-close" aria-label="关闭" @click="loadOpen = false">
            <span v-html="ICONS.close"></span>
          </button>
        </div>
        <div class="load-list">
          <button
            v-for="f in sumsDesc"
            :key="f.message_id"
            class="load-item"
            @click="branchAt(f.message_id)"
          >
            <span class="load-floor">第 {{ f.message_id }} 楼</span>
            <span class="load-text">{{ f.sum }}</span>
          </button>
          <div v-if="!sums.length" class="reading-empty">暂无摘要记录。</div>
        </div>
      </div>
    </div>

    <!-- 长按上下文菜单 -->
    <div
      v-if="contextMenu"
      class="context-menu"
      :style="{ left: menuLeft + 'px', top: menuTop + 'px' }"
      @click.stop
    >
      <div class="ctx-head">
        <span class="ctx-title">操作</span>
        <button class="ctx-close" aria-label="关闭" @click="contextMenu = null">
          <span v-html="ICONS.close"></span>
        </button>
      </div>
      <button class="ctx-item" :disabled="sending" @click="regenerate">
        <span class="ctx-icon" v-html="ICONS.refresh"></span>
        <span class="ctx-label">{{ sending ? '处理中…' : '重roll' }}</span>
      </button>
      <button class="ctx-item" :disabled="sending" @click="openEdit">
        <span class="ctx-icon" v-html="ICONS.edit"></span>
        <span class="ctx-label">编辑正文</span>
      </button>
    </div>

    <!-- 编辑正文模态框 -->
    <div v-if="editingMessage" class="edit-overlay" @click.self="editingMessage = null">
      <div class="edit-panel">
        <div class="edit-head">
          <span class="edit-title">编辑正文</span>
          <button class="load-close" aria-label="关闭" @click="editingMessage = null">
            <span v-html="ICONS.close"></span>
          </button>
        </div>
        <div class="edit-body">
          <textarea
            v-model="editingMessage.text"
            class="edit-textarea"
            spellcheck="false"
          ></textarea>
          <div class="edit-actions">
            <button class="edit-btn primary" @click="saveEdit">保存</button>
            <button class="edit-btn" @click="editingMessage = null">取消</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 招募界面 -->
    <RecruitPanel v-if="recruitOpen" :sending="sending" @close="recruitOpen = false" @recruit="send" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { extractStreamingMaintext, loadAllMaintexts, loadAllSums, loadLatestMessage, parseMaintext, parseSum, type FloorMaintext, type FloorSum } from '../messageParser';
import { ICONS } from '../icons';
import { useDataStore } from '../store';
import RecruitPanel from './RecruitPanel.vue';

const store = useDataStore();

const LETTERS = ['A', 'B', 'C', 'D'];

const maintext = ref('');
const options = ref<string[]>([]);
const input = ref('');
const sending = ref(false);
const tick = ref(0);

const optionsOpen = ref(false);
const readingMode = ref(false);
const loadOpen = ref(false);
const recruitOpen = ref(false);
const isFullscreen = ref(false);
const floors = ref<FloorMaintext[]>([]);
const sums = ref<FloorSum[]>([]);

const sumsDesc = computed(() => sums.value.slice().reverse());
const canRecruit = computed(() => store.data.世界.当前地点 === '后方城市');

const streamingText = ref('');
const streamingMaintext = computed(() => extractStreamingMaintext(streamingText.value));

// 长按 / 上下文菜单 / 编辑状态
const contextMenu = ref<{ x: number; y: number } | null>(null);
const editingMessage = ref<{ messageId: number; text: string; fullMessage: string } | null>(null);
const currentMessageInfo = ref<{ messageId?: number; userMessageId?: number; fullMessage?: string }>({});
let longPressTimer: number | null = null;
let menuJustOpened = false;

const menuLeft = computed(() => {
  if (!contextMenu.value) return 0;
  return Math.min(contextMenu.value.x, window.innerWidth - 220);
});
const menuTop = computed(() => {
  if (!contextMenu.value) return 0;
  return Math.min(contextMenu.value.y, window.innerHeight - 120);
});

function refresh() {
  const parsed = loadLatestMessage();
  maintext.value = parsed.maintext;
  options.value = parsed.options;
  currentMessageInfo.value = {
    messageId: parsed.messageId,
    userMessageId: parsed.userMessageId,
    fullMessage: parsed.fullMessage,
  };
  sending.value = false;
  optionsOpen.value = false;
  tick.value++;
}

async function send(text: string) {
  const t = text.trim();
  if (!t || sending.value) return;
  sending.value = true;
  input.value = '';
  optionsOpen.value = false;
  streamingText.value = '';
  let userMessageId: number | undefined;
  try {
    // 1. 获取当前变量（旧状态，须在创建 user 消息之前获取）
    const old_data = Mvu.getMvuData({ type: 'message', message_id: 'latest' });

    // 2. 创建 user 消息（携带旧变量副本，生成期间 store 仍读到正确状态；记录 id 便于回滚）
    await createChatMessages([{ role: 'user', message: t, data: _.cloneDeep(old_data) }], { refresh: 'none' });
    userMessageId = getLastMessageId();

    // 3. 生成 LLM 回复（流式）
    const reply = await generate({ user_input: t, should_stream: true, generation_id: 'vault-main' });

    // 4. 校验格式规范：必须包含非空 <maintext>
    if (!parseMaintext(reply)) {
      throw new Error('回复格式不符合规范（缺少 <maintext> 正文）');
    }

    // 5. 解析变量命令（_.set 命令 → 新变量表）
    const parsed = await Mvu.parseMessage(reply, old_data);
    const new_data = parsed ?? old_data;

    // 6. 创建 assistant 楼层消息（不触发生成、不刷新）
    await createChatMessages([{ role: 'assistant', message: reply, data: new_data }], { refresh: 'none' });

    // 6.5 维护编年史：把本轮 <sum> 写入世界书「编年史」条目
    await updateChronicle(reply, getLastMessageId());

    // 7. 刷新前端显示
    refresh();
  } catch (error) {
    console.error('[MaintextPanel] 发送失败:', error);
    // 回滚：删除已创建的 user 楼层，恢复发送前状态
    if (userMessageId !== undefined) {
      try {
        await deleteChatMessages([userMessageId], { refresh: 'none' });
      } catch (rollbackError) {
        console.error('[MaintextPanel] 回滚删除 user 楼层失败:', rollbackError);
      }
    }
    // 还原输入框文本，便于重试
    input.value = t;
  } finally {
    sending.value = false;
  }
}

function choose(opt: string) {
  void send(opt);
}

function submit() {
  void send(input.value);
}

function toggleReading() {
  if (readingMode.value) {
    readingMode.value = false;
  } else {
    floors.value = loadAllMaintexts();
    readingMode.value = true;
  }
}

function openLoad() {
  sums.value = loadAllSums();
  loadOpen.value = true;
}

async function branchAt(messageId: number) {
  try {
    await triggerSlash(`/branch-create ${messageId}`);
    loadOpen.value = false;
    readingMode.value = false;
  } catch (error) {
    console.error('[MaintextPanel] 创建分支失败:', error);
  }
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  } else {
    void document.documentElement.requestFullscreen();
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

// ---------- 长按 ----------
function startLongPress(e: MouseEvent | TouchEvent) {
  if (contextMenu.value || !maintext.value || currentMessageInfo.value.messageId === undefined) return;
  longPressTimer = window.setTimeout(() => {
    let x = 0;
    let y = 0;
    if ('touches' in e) {
      const t = (e as TouchEvent).touches[0];
      if (t) {
        x = t.clientX;
        y = t.clientY;
      }
    } else {
      x = (e as MouseEvent).clientX;
      y = (e as MouseEvent).clientY;
    }
    contextMenu.value = { x, y };
    menuJustOpened = true;
    longPressTimer = null;
  }, 500);
}

function endLongPress() {
  if (longPressTimer !== null) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

function onMouseDown(e: MouseEvent) {
  startLongPress(e);
}

function onTouchStart(e: TouchEvent) {
  startLongPress(e);
}

// ---------- 重roll ----------
async function regenerate() {
  const info = currentMessageInfo.value;
  if (info.messageId === undefined) {
    contextMenu.value = null;
    return;
  }
  contextMenu.value = null;
  sending.value = true;
  try {
    await deleteChatMessages([info.messageId], { refresh: 'none' });
    await triggerSlash('/trigger');
  } catch (error) {
    console.error('[MaintextPanel] 重roll失败:', error);
    sending.value = false;
  }
}

// ---------- 编辑 ----------
function openEdit() {
  const info = currentMessageInfo.value;
  if (info.messageId === undefined || !info.fullMessage) {
    contextMenu.value = null;
    return;
  }
  const match = info.fullMessage.match(/<maintext>([\s\S]*?)<\/maintext>/i);
  if (!match) {
    console.warn('[MaintextPanel] 无法提取正文');
    contextMenu.value = null;
    return;
  }
  editingMessage.value = {
    messageId: info.messageId,
    text: match[1].trim(),
    fullMessage: info.fullMessage,
  };
  contextMenu.value = null;
}

async function updateChronicle(reply: string, messageId: number) {
  try {
    const sum = parseSum(reply);
    if (!sum) return;
    // 编号 = 楼层号 ÷ 2（0 层开场、2 层起为 AI 回复）
    const num = Math.floor(messageId / 2);

    const wbNames = getCharWorldbookNames('current');
    const wbName = wbNames.primary || '灰烬挽歌';
    const worldbook = await getWorldbook(wbName);
    const entry = worldbook.find(e => e.name === '编年史' || (e as any).comment === '编年史');
    if (!entry) return;

    // 解析现有内容为「【编号】摘要」列表
    const parsed = (entry.content || '')
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(line => {
        const m = line.match(/^【(\d+)】(.*)$/);
        return m ? { num: parseInt(m[1], 10), text: m[2] } : null;
      })
      .filter((p): p is { num: number; text: string } => p !== null);

    const exists = parsed.some(p => p.num === num);
    const updated = exists ? parsed.filter(p => p.num < num) : parsed;
    updated.push({ num, text: sum });
    updated.sort((a, b) => a.num - b.num);

    entry.content = updated.map(p => `【${p.num}】${p.text}`).join('\n');
    await replaceWorldbook(wbName, worldbook);
    console.info(`[编年史] 已写入第 ${num} 条摘要`);
  } catch (error) {
    console.error('[编年史] 更新失败:', error);
  }
}

async function saveEdit() {
  if (!editingMessage.value) return;
  const { messageId, text, fullMessage } = editingMessage.value;
  const updated = fullMessage.replace(/<maintext>[\s\S]*?<\/maintext>/i, `<maintext>${text}</maintext>`);
  try {
    await setChatMessages([{ message_id: messageId, message: updated }], { refresh: 'none' });
    editingMessage.value = null;
    refresh();
  } catch (error) {
    console.error('[MaintextPanel] 保存编辑失败:', error);
  }
}

// ---------- 点击外部关闭菜单 ----------
function onDocumentClick(e: MouseEvent) {
  if (!contextMenu.value) return;
  if (menuJustOpened) {
    menuJustOpened = false;
    return;
  }
  const target = e.target as HTMLElement;
  if (!target.closest('.context-menu')) {
    contextMenu.value = null;
  }
}

onMounted(() => {
  refresh();
  eventOn(tavern_events.MESSAGE_RECEIVED, () => refresh());
  eventOn(tavern_events.MESSAGE_UPDATED, () => refresh());
  eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, () => refresh());
  // 流式：累积增量文本，实时提取正文
  eventOn(iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY, (incremental_text: string, generation_id: string) => {
    if (generation_id !== 'vault-main') return;
    streamingText.value += incremental_text;
  });
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('click', onDocumentClick, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  document.removeEventListener('click', onDocumentClick, true);
  if (longPressTimer !== null) clearTimeout(longPressTimer);
});
</script>

<style lang="scss" scoped>
.maintext-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.mt-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.mt-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}
.mt-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 8px var(--gold);
  flex: none;
}
.mt-location {
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--bone);
}
.mt-time {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--ash-dim);
}
.mt-fog {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--ice);
  padding: 2px 9px;
  border: 1px solid rgba(143, 179, 201, 0.3);
  border-radius: 999px;
  background: rgba(143, 179, 201, 0.06);
}

.toolbar {
  display: flex;
  gap: 6px;
  flex: none;
}
.tool-btn {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: rgba(230, 226, 216, 0.02);
  color: var(--ash-dim);
  cursor: pointer;
  transition: all 0.2s ease;
}
.tool-btn :deep(svg) {
  width: 16px;
  height: 16px;
}
.tool-btn:hover {
  color: var(--bone);
  border-color: var(--line-bright);
  background: rgba(230, 226, 216, 0.06);
}
.tool-btn.active {
  color: var(--gold-soft);
  border-color: rgba(212, 168, 96, 0.45);
  background: rgba(212, 168, 96, 0.1);
}
.tool-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.mt-body {
  padding: 16px 18px;
  min-height: 120px;
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: linear-gradient(160deg, rgba(230, 226, 216, 0.03), rgba(18, 22, 32, 0.4));
  font-family: var(--font-serif);
  font-size: 15px;
  line-height: 1.95;
  letter-spacing: 0.02em;
  color: var(--bone);
  white-space: pre-wrap;
  word-break: break-word;
}
.mt-body.longpressable {
  cursor: pointer;
  user-select: none;
}
.mt-body.is-empty {
  color: var(--ash-faint);
  font-family: var(--font-sans);
  font-size: 13px;
  display: grid;
  place-items: center;
  text-align: center;
  cursor: default;
}
/* 选项展开时收缩正文框，给选项和输入框让出空间 */
.maintext-panel.opts-open .mt-body {
  min-height: 80px;
  max-height: 150px;
}

.generating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px;
  border: 1px dashed var(--line-strong);
  border-radius: 14px;
  color: var(--ash-dim);
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.08em;
}
.gen-ring {
  width: 14px;
  height: 14px;
  flex: none;
  border: 2px solid rgba(212, 168, 96, 0.25);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.generating.streaming {
  display: block;
  padding: 16px 18px;
  border-style: solid;
  border-color: var(--line);
  background: linear-gradient(160deg, rgba(230, 226, 216, 0.03), rgba(18, 22, 32, 0.4));
}
.streaming-text {
  font-family: var(--font-serif);
  font-size: 15px;
  line-height: 1.95;
  letter-spacing: 0.02em;
  color: var(--bone);
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 120px;
  max-height: 320px;
  overflow-y: auto;
}
.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 2px;
  vertical-align: -0.12em;
  background: var(--gold);
  animation: blink 0.9s steps(1) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}

.options-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.options-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(230, 226, 216, 0.02);
  color: var(--ash);
  cursor: pointer;
  transition: all 0.22s ease;
}
.options-toggle:hover {
  color: var(--bone);
  border-color: var(--line-bright);
  background: rgba(230, 226, 216, 0.05);
}
.toggle-icon {
  width: 16px;
  height: 16px;
  display: grid;
  place-items: center;
  color: var(--gold);
  transition: transform 0.25s ease;
}
.toggle-icon :deep(svg) {
  width: 15px;
  height: 15px;
}
.toggle-icon.open {
  transform: rotate(180deg);
}
.toggle-label {
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.08em;
  flex: 1;
  text-align: left;
}
.toggle-badge {
  font-family: var(--font-display);
  font-size: 11px;
  color: var(--gold-soft);
  border: 1px solid rgba(212, 168, 96, 0.4);
  border-radius: 999px;
  padding: 1px 9px;
  background: rgba(212, 168, 96, 0.08);
}

.collapse-enter-active,
.collapse-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(230, 226, 216, 0.02);
  color: var(--ash);
  text-align: left;
  cursor: pointer;
  animation: option-in 0.45s cubic-bezier(0.22, 0.9, 0.34, 1) backwards;
  animation-delay: var(--d, 0ms);
  transition: border-color 0.22s ease, background 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease, color 0.22s ease;
}
@keyframes option-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.option:hover {
  color: var(--bone);
  border-color: rgba(212, 168, 96, 0.5);
  background: linear-gradient(90deg, rgba(212, 168, 96, 0.12), rgba(212, 168, 96, 0.02));
  transform: translateX(3px);
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.35);
}
.option:active {
  transform: translateX(3px) scale(0.99);
}
.option-badge {
  width: 26px;
  height: 26px;
  flex: none;
  display: grid;
  place-items: center;
  border: 1px solid rgba(212, 168, 96, 0.4);
  border-radius: 8px;
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  color: var(--gold-soft);
  background: rgba(212, 168, 96, 0.06);
  transition: all 0.22s ease;
}
.option:hover .option-badge {
  background: var(--gold);
  color: #1a1208;
  box-shadow: 0 0 14px rgba(212, 168, 96, 0.5);
}
.option-text {
  flex: 1;
  min-width: 0;
  font-family: var(--font-serif);
  font-size: 13.5px;
  letter-spacing: 0.03em;
  line-height: 1.5;
}
.option-arrow {
  width: 16px;
  height: 16px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--ash-faint);
  transition: transform 0.22s ease, color 0.22s ease;
}
.option-arrow :deep(svg) {
  width: 15px;
  height: 15px;
}
.option:hover .option-arrow {
  color: var(--gold);
  transform: translateX(3px);
}

.composer {
  display: flex;
  gap: 8px;
  align-items: center;
}
.composer-input {
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  background: rgba(11, 14, 20, 0.6);
  color: var(--bone);
  font-family: var(--font-sans);
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.22s ease, box-shadow 0.22s ease;
}
.composer-input::placeholder {
  color: var(--ash-faint);
}
.composer-input:focus {
  border-color: rgba(212, 168, 96, 0.5);
  box-shadow: 0 0 0 3px rgba(212, 168, 96, 0.12);
}
.composer-input:disabled {
  opacity: 0.5;
}
.composer-send {
  width: 42px;
  height: 42px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--gold), #b98a43);
  color: #1a1208;
  box-shadow: 0 4px 16px rgba(212, 168, 96, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
}
.composer-send :deep(svg) {
  width: 18px;
  height: 18px;
}
.composer-send:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.06);
  box-shadow: 0 6px 22px rgba(212, 168, 96, 0.42);
}
.composer-send:active:not(:disabled) {
  transform: scale(0.95);
}
.composer-send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.reading-mode {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}
.reading-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--line);
}
.reading-title {
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.16em;
  color: var(--bone);
}
.reading-count {
  font-family: var(--font-display);
  font-size: 11px;
  color: var(--ash-faint);
  letter-spacing: 0.1em;
}
.reading-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 56vh;
  overflow-y: auto;
  padding-right: 2px;
}
.reading-item {
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(230, 226, 216, 0.02);
  padding: 11px 14px;
}
.reading-floor {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--gold);
  margin-bottom: 5px;
}
.reading-text {
  font-family: var(--font-serif);
  font-size: 13.5px;
  line-height: 1.85;
  color: var(--ash);
  white-space: pre-wrap;
  word-break: break-word;
}
.reading-empty {
  padding: 24px;
  text-align: center;
  color: var(--ash-faint);
  font-family: var(--font-serif);
  font-size: 13px;
}

.load-overlay,
.edit-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(4, 5, 8, 0.7);
  backdrop-filter: blur(8px);
  animation: overlay-in 0.25s ease;
}
@keyframes overlay-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.load-panel,
.edit-panel {
  width: min(560px, 100%);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line-strong);
  border-radius: 18px;
  background: linear-gradient(160deg, rgba(24, 29, 42, 0.95), rgba(13, 16, 24, 0.98));
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
  overflow: hidden;
  animation: panel-in 0.3s cubic-bezier(0.34, 1.4, 0.44, 1);
}
@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.load-head,
.edit-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
}
.load-title,
.edit-title {
  font-family: var(--font-serif);
  font-size: 15px;
  letter-spacing: 0.08em;
  color: var(--bone);
}
.load-close {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ash-dim);
  cursor: pointer;
  transition: all 0.2s ease;
}
.load-close :deep(svg) {
  width: 15px;
  height: 15px;
}
.load-close:hover {
  color: var(--bone);
  border-color: var(--line-bright);
  background: rgba(230, 226, 216, 0.06);
}
.load-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  overflow-y: auto;
}
.load-item {
  display: flex;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: rgba(230, 226, 216, 0.02);
  color: var(--ash);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}
.load-item:hover {
  border-color: rgba(212, 168, 96, 0.45);
  background: rgba(212, 168, 96, 0.06);
  transform: translateX(2px);
}
.load-floor {
  flex: none;
  font-family: var(--font-display);
  font-size: 11px;
  color: var(--gold-soft);
  letter-spacing: 0.08em;
  padding-top: 2px;
}
.load-text {
  font-family: var(--font-serif);
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--ash);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 长按上下文菜单 */
.context-menu {
  position: fixed;
  z-index: 100;
  min-width: 180px;
  padding: 6px;
  border: 1px solid var(--line-strong);
  border-radius: 14px;
  background: linear-gradient(160deg, rgba(24, 29, 42, 0.97), rgba(13, 16, 24, 0.98));
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(212, 168, 96, 0.06);
  animation: menu-in 0.18s cubic-bezier(0.34, 1.4, 0.44, 1);
}
@keyframes menu-in {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.ctx-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 8px;
  border-bottom: 1px solid var(--line);
}
.ctx-title {
  font-family: var(--font-serif);
  font-size: 11px;
  letter-spacing: 0.2em;
  color: var(--ash-dim);
}
.ctx-close {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  color: var(--ash-faint);
  cursor: pointer;
  border-radius: 6px;
}
.ctx-close :deep(svg) {
  width: 13px;
  height: 13px;
}
.ctx-close:hover {
  color: var(--bone);
  background: rgba(230, 226, 216, 0.06);
}
.ctx-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  margin-top: 4px;
  border-radius: 9px;
  color: var(--ash);
  cursor: pointer;
  transition: all 0.18s ease;
}
.ctx-item:hover:not(:disabled) {
  color: var(--bone);
  background: rgba(212, 168, 96, 0.08);
}
.ctx-item:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.ctx-icon {
  width: 16px;
  height: 16px;
  display: grid;
  place-items: center;
  color: var(--gold);
}
.ctx-icon :deep(svg) {
  width: 15px;
  height: 15px;
}
.ctx-label {
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.04em;
}

/* 编辑模态框 */
.edit-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.edit-textarea {
  width: 100%;
  height: 320px;
  padding: 12px;
  resize: none;
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  background: rgba(11, 14, 20, 0.7);
  color: var(--bone);
  font-family: var(--font-serif);
  font-size: 14px;
  line-height: 1.8;
  outline: none;
}
.edit-textarea:focus {
  border-color: rgba(212, 168, 96, 0.5);
  box-shadow: 0 0 0 3px rgba(212, 168, 96, 0.1);
}
.edit-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.edit-btn {
  padding: 8px 20px;
  border: 1px solid var(--line-strong);
  border-radius: 10px;
  color: var(--ash);
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.2s ease;
}
.edit-btn:hover {
  color: var(--bone);
  border-color: var(--line-bright);
  background: rgba(230, 226, 216, 0.05);
}
.edit-btn.primary {
  background: linear-gradient(135deg, var(--gold), #b98a43);
  color: #1a1208;
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(212, 168, 96, 0.3);
}
.edit-btn.primary:hover {
  filter: brightness(1.06);
  color: #1a1208;
}
</style>
