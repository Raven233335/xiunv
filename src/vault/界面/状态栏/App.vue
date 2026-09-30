<template>
  <div class="card">
    <header class="header">
      <div class="brand">
        <span class="brand-mark" v-html="ICONS.logo"></span>
        <div class="brand-text">
          <h1 class="brand-title">灰烬挽歌</h1>
          <span class="brand-sub">WASTELAND REQUIEM</span>
        </div>
      </div>
      <button
        class="sidebar-toggle"
        :class="{ collapsed: sidebarCollapsed }"
        :title="sidebarCollapsed ? '展开概况' : '收起概况'"
        @click="sidebarCollapsed = !sidebarCollapsed"
      >
        <span v-html="ICONS.panel"></span>
      </button>
    </header>

    <div class="layout">
      <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <OverviewPanel v-show="!sidebarCollapsed" @select="openDetail" />
      </aside>
      <main class="main">
        <MaintextPanel />
      </main>
    </div>

    <CharacterDetail v-if="detailTarget" :target="detailTarget" @close="detailTarget = null" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MaintextPanel from './components/MaintextPanel.vue';
import OverviewPanel from './components/OverviewPanel.vue';
import CharacterDetail from './components/CharacterDetail.vue';
import { ICONS } from './icons';

const sidebarCollapsed = ref(false);
const detailTarget = ref<{ type: 'member' | 'nun'; name: string } | null>(null);

function openDetail(type: 'member' | 'nun', name: string) {
  detailTarget.value = { type, name };
}
</script>

<style lang="scss" scoped>
.card {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--glass);
  backdrop-filter: blur(14px);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.4);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.brand-mark {
  width: 34px;
  height: 34px;
  flex: none;
  display: grid;
  place-items: center;
  color: var(--gold);
  filter: drop-shadow(0 0 8px rgba(212, 168, 96, 0.35));
}
.brand-mark svg {
  width: 24px;
  height: 24px;
}
.brand-title {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.1em;
}
.brand-sub {
  font-family: var(--font-display);
  font-size: 8.5px;
  letter-spacing: 0.24em;
  color: var(--ash-faint);
  text-transform: uppercase;
}
.sidebar-toggle {
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
.sidebar-toggle :deep(svg) {
  width: 16px;
  height: 16px;
}
.sidebar-toggle:hover {
  color: var(--bone);
  border-color: var(--line-bright);
}
.sidebar-toggle.collapsed {
  color: var(--gold-soft);
  border-color: rgba(212, 168, 96, 0.45);
}
.layout {
  display: flex;
  gap: 14px;
  min-height: 0;
}
.sidebar {
  width: 250px;
  flex: none;
  border-right: 1px solid var(--line);
  overflow: hidden;
  transition: width 0.28s ease;
}
.sidebar.collapsed {
  width: 0;
  border-right: none;
}
.main {
  flex: 1;
  min-width: 0;
  min-height: 0;
}
</style>
