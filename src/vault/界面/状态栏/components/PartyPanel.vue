<template>
  <div class="split">
    <div class="roster">
      <button
        v-for="(m, name) in store.data.队伍人员"
        :key="name"
        class="roster-item"
        :class="{ 'is-selected': name === currentName }"
        @click="selected = name"
      >
        <Avatar :name="name" size="xs" />
        <span class="roster-main">
          <span class="roster-name">{{ name }}</span>
          <span class="roster-meta">{{ m.性别 }} · {{ m.年龄 }}</span>
        </span>
        <span class="roster-live">生命 <b>{{ m.生命值 }}</b></span>
      </button>
    </div>

    <div v-if="current" class="detail">
      <div class="detail-hero">
        <Avatar :name="current.name" size="lg" />
        <div class="detail-id">
          <div class="detail-name">{{ current.name }}</div>
          <div class="detail-role">{{ current.data.性别 }} · {{ current.data.年龄 }} 岁</div>
        </div>
      </div>

      <div>
        <div class="section-title">个人信息</div>
        <div class="info-grid">
          <div class="info-cell"><div class="info-label">姓名</div><div class="info-value">{{ current.name }}</div></div>
          <div class="info-cell"><div class="info-label">年龄</div><div class="info-value">{{ current.data.年龄 }}</div></div>
          <div class="info-cell"><div class="info-label">性别</div><div class="info-value">{{ current.data.性别 }}</div></div>
        </div>
      </div>

      <div>
        <div class="section-title">描述</div>
        <div class="desc-list">
          <div class="desc-item"><span class="desc-label">外貌</span>{{ current.data.外貌 }}</div>
          <div class="desc-item"><span class="desc-label">背景</span>{{ current.data.背景 }}</div>
          <div class="desc-item"><span class="desc-label">浊化表现</span>{{ current.data.浊化表现 }}</div>
        </div>
      </div>

      <div>
        <div class="section-title">核心数值</div>
        <div class="stats-list">
          <div class="stat-row">
            <div class="stat-row-top">
              <span class="stat-row-name"><span class="icon" v-html="ICONS.pressure"></span>压力值</span>
              <span class="stat-row-value">{{ current.data.压力值 }}<i>/ 100</i></span>
            </div>
            <div class="bar"><div class="bar-fill pressure" :style="{ width: current.data.压力值 + '%' }"></div></div>
          </div>
          <div class="stat-row">
            <div class="stat-row-top">
              <span class="stat-row-name"><span class="icon" v-html="ICONS.drop"></span>精液存量</span>
              <span class="stat-row-value">{{ current.data.精液存量 }}<i> ml</i></span>
            </div>
            <div class="bar"><div class="bar-fill ice" :style="{ width: Math.min((current.data.精液存量 / 200) * 100, 100) + '%' }"></div></div>
          </div>
        </div>
      </div>

      <div>
        <div class="section-title">生存状态</div>
        <div class="stats-list">
          <div class="stat-row">
            <div class="stat-row-top">
              <span class="stat-row-name"><span class="icon" v-html="ICONS.hp"></span>生命值</span>
              <span class="stat-row-value">{{ current.data.生命值 }}<i>/ 100</i></span>
            </div>
            <div class="bar"><div class="bar-fill life" :style="{ width: current.data.生命值 + '%' }"></div></div>
          </div>
          <div class="stat-row">
            <div class="stat-row-top">
              <span class="stat-row-name"><span class="icon" v-html="ICONS.corruption"></span>浊化等级</span>
              <span class="stat-row-value">{{ current.data.浊化等级 }}<i>/ 5</i></span>
            </div>
            <div class="pips">
              <span v-for="i in 5" :key="i" class="pip crimson" :class="{ on: i <= current.data.浊化等级 }"></span>
              <span class="pips-num">{{ current.data.浊化等级 }} / 5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Avatar from './Avatar.vue';
import { ICONS } from '../icons';
import { useDataStore } from '../store';

const store = useDataStore();
const selected = ref('');

const current = computed(() => {
  const names = Object.keys(store.data.队伍人员);
  const name = names.includes(selected.value) ? selected.value : names[0];
  return name ? { name, data: store.data.队伍人员[name] } : null;
});
const currentName = computed(() => current.value?.name ?? '');
</script>

<style lang="scss" scoped>
.desc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.desc-item {
  font-size: 13px;
  line-height: 1.7;
  color: var(--ash);
  padding: 9px 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: rgba(230, 226, 216, 0.02);
}
.desc-label {
  font-family: var(--font-serif);
  color: var(--ash-faint);
  letter-spacing: 0.12em;
  margin-right: 8px;
}
@media (max-width: 560px) {
  .split {
    grid-template-columns: 1fr;
  }
}
</style>
