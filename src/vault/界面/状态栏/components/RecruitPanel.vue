<template>
  <div class="recruit-overlay" @click.self="$emit('close')">
    <div class="recruit-panel">
      <div class="recruit-head">
        <span class="recruit-title">招募</span>
        <button class="load-close" aria-label="关闭" @click="$emit('close')">
          <span v-html="ICONS.close"></span>
        </button>
      </div>

      <div class="recruit-tabs">
        <button class="recruit-tab" :class="{ active: tab === 'member' }" @click="tab = 'member'">招募新队员</button>
        <button class="recruit-tab" :class="{ active: tab === 'nun' }" @click="tab = 'nun'">招募修女</button>
      </div>

      <div class="recruit-body">
        <button class="recruit-refresh" :disabled="sending" @click="refresh">
          <span class="refresh-icon" v-html="ICONS.refresh"></span>
          <span>{{ sending ? '生成中…' : '刷新名单' }}</span>
        </button>

        <!-- 队员候选 -->
        <template v-if="tab === 'member'">
          <div v-for="(c, name) in store.data.招募池.队员" :key="name" class="candidate">
            <div class="candidate-head">
              <span class="candidate-name">{{ name }}</span>
              <span class="candidate-meta">{{ c.性别 }} · {{ c.年龄 }}</span>
              <span class="candidate-badge">浊化 {{ c.浊化等级 }}</span>
            </div>
            <div class="candidate-line"><i>外貌</i>{{ c.外貌 }}</div>
            <div class="candidate-line"><i>背景</i>{{ c.背景 }}</div>
            <div class="candidate-line"><i>浊化表现</i>{{ c.浊化表现 }}</div>
            <button class="candidate-recruit" :disabled="sending" @click="recruitMember(name)">招募</button>
          </div>
          <div v-if="!memberCount" class="candidate-empty">暂无候选，点「刷新名单」生成一批</div>
        </template>

        <!-- 修女候选 -->
        <template v-else>
          <div v-for="(c, name) in store.data.招募池.修女" :key="name" class="candidate">
            <div class="candidate-head">
              <span class="candidate-name">{{ name }}</span>
              <span class="candidate-meta">{{ c.性别 }} · {{ c.年龄 }}</span>
              <span class="candidate-badge">机芯 {{ c.机芯等级 }}</span>
            </div>
            <div class="candidate-line"><i>外貌</i>{{ c.外貌 }}</div>
            <div class="candidate-line"><i>背景</i>{{ c.背景 }}</div>
            <div class="candidate-yinxia">
              <div class="yinxia-title">淫匣 · {{ c.淫匣.名字 }}</div>
              <div class="candidate-line"><i>机芯形态</i>{{ c.淫匣.机芯形态 }}</div>
              <div class="candidate-line"><i>外表描述</i>{{ c.淫匣.外表描述 }}</div>
            </div>
            <button class="candidate-recruit" :disabled="sending" @click="recruitNun(name)">招募</button>
          </div>
          <div v-if="!nunCount" class="candidate-empty">暂无候选，点「刷新名单」生成一批</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ICONS } from '../icons';
import { useDataStore } from '../store';

const props = defineProps<{ sending: boolean }>();
const emit = defineEmits<{ close: []; recruit: [text: string] }>();

const store = useDataStore();
const tab = ref<'member' | 'nun'>('member');

const memberCount = computed(() => Object.keys(store.data.招募池.队员).length);
const nunCount = computed(() => Object.keys(store.data.招募池.修女).length);

function refresh() {
  const prompt =
    tab.value === 'member'
      ? '你在后方城市的王国征兵办刷新招募名单，生成 3~5 名可招募的队员候选（外貌、背景、年龄、性别、浊化等级）并写入招募池.队员'
      : '你在后方城市的教会刷新招募名单，生成 3~5 名可招募的修女候选（外貌、背景、年龄、性别、机芯等级、淫匣）并写入招募池.修女';
  emit('recruit', prompt);
}

function recruitMember(name: string) {
  emit('recruit', `招募『${name}』为队员，生成完整初始数值并加入队伍`);
}

function recruitNun(name: string) {
  emit('recruit', `招募『${name}』为修女，生成完整初始数值并加入修女`);
}
</script>

<style lang="scss" scoped>
.recruit-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(4, 5, 8, 0.72);
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
.recruit-panel {
  width: min(640px, 100%);
  max-height: 84vh;
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
.recruit-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
}
.recruit-title {
  font-family: var(--font-serif);
  font-size: 16px;
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

.recruit-tabs {
  display: flex;
  gap: 6px;
  padding: 12px 16px 0;
}
.recruit-tab {
  flex: 1;
  padding: 8px 6px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: rgba(230, 226, 216, 0.02);
  color: var(--ash-dim);
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;
}
.recruit-tab:hover {
  color: var(--bone);
  border-color: var(--line-bright);
}
.recruit-tab.active {
  color: var(--gold-soft);
  border-color: rgba(212, 168, 96, 0.45);
  background: linear-gradient(90deg, rgba(212, 168, 96, 0.14), rgba(212, 168, 96, 0.03));
}

.recruit-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px 16px;
  overflow-y: auto;
}
.recruit-refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 14px;
  border: 1px solid var(--line-strong);
  border-radius: 11px;
  background: rgba(230, 226, 216, 0.03);
  color: var(--ash);
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.2s ease;
}
.recruit-refresh:hover:not(:disabled) {
  color: var(--bone);
  border-color: var(--line-bright);
  background: rgba(230, 226, 216, 0.06);
}
.recruit-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.refresh-icon {
  width: 15px;
  height: 15px;
  display: grid;
  place-items: center;
  color: var(--gold);
}
.refresh-icon :deep(svg) {
  width: 14px;
  height: 14px;
}

.candidate {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 13px 14px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: rgba(230, 226, 216, 0.02);
}
.candidate-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.candidate-name {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 600;
  color: var(--bone);
  letter-spacing: 0.04em;
}
.candidate-meta {
  font-size: 12px;
  color: var(--ash-dim);
}
.candidate-badge {
  margin-left: auto;
  font-family: var(--font-display);
  font-size: 11px;
  color: var(--gold-soft);
  border: 1px solid rgba(212, 168, 96, 0.4);
  border-radius: 999px;
  padding: 1px 9px;
  background: rgba(212, 168, 96, 0.08);
}
.candidate-line {
  font-size: 13px;
  line-height: 1.6;
  color: var(--ash);
}
.candidate-line i {
  font-style: normal;
  font-family: var(--font-serif);
  color: var(--ash-faint);
  letter-spacing: 0.1em;
  margin-right: 8px;
}
.candidate-yinxia {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 9px 11px;
  border: 1px solid rgba(156, 120, 192, 0.25);
  border-radius: 9px;
  background: rgba(156, 120, 192, 0.06);
}
.yinxia-title {
  font-family: var(--font-serif);
  font-size: 11px;
  letter-spacing: 0.2em;
  color: var(--violet);
}
.candidate-recruit {
  align-self: flex-end;
  padding: 6px 18px;
  border: 1px solid rgba(212, 168, 96, 0.45);
  border-radius: 9px;
  background: linear-gradient(135deg, var(--gold), #b98a43);
  color: #1a1208;
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.2s ease;
}
.candidate-recruit:hover:not(:disabled) {
  filter: brightness(1.06);
  box-shadow: 0 4px 14px rgba(212, 168, 96, 0.35);
}
.candidate-recruit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.candidate-empty {
  padding: 26px;
  text-align: center;
  color: var(--ash-faint);
  font-family: var(--font-serif);
  font-size: 13px;
}
</style>
