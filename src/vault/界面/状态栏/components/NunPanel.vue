<template>
  <div class="split">
    <div class="roster">
      <button
        v-for="(n, name) in store.data.修女"
        :key="name"
        class="roster-item"
        :class="{ 'is-selected': name === currentName }"
        @click="selected = name"
      >
        <Avatar :name="name" size="xs" />
        <span class="roster-main">
          <span class="roster-name">{{ name }}</span>
          <span class="roster-meta">{{ n.性别 }} · {{ n.年龄 }}</span>
        </span>
        <span class="roster-live">耐受 <b>{{ n.身体耐受值 }}</b></span>
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
        <div class="section-title">核心数值</div>
        <div class="stats-list">
          <div class="stat-row">
            <div class="stat-row-top">
              <span class="stat-row-name"><span class="icon" v-html="ICONS.succubus"></span>淫魔精液量</span>
              <span class="stat-row-value">{{ current.data.淫魔精液量 }}<i>/ 100</i></span>
            </div>
            <div class="bar"><div class="bar-fill violet" :style="{ width: current.data.淫魔精液量 + '%' }"></div></div>
          </div>
          <div class="stat-row">
            <div class="stat-row-top">
              <span class="stat-row-name"><span class="icon" v-html="ICONS.mechanism"></span>机芯等级</span>
              <span class="stat-row-value">{{ current.data.机芯等级 }}<i>/ 5</i></span>
            </div>
            <div class="pips">
              <span v-for="i in 5" :key="i" class="pip violet" :class="{ on: i <= current.data.机芯等级 }"></span>
              <span class="pips-num">{{ current.data.机芯等级 }} / 5</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="section-title">生存状态</div>
        <div class="stats-list">
          <div class="stat-row">
            <div class="stat-row-top">
              <span class="stat-row-name"><span class="icon" v-html="ICONS.endurance"></span>身体耐受值</span>
              <span class="stat-row-value">{{ current.data.身体耐受值 }}<i>/ 100</i></span>
            </div>
            <div class="bar"><div class="bar-fill crimson" :style="{ width: current.data.身体耐受值 + '%' }"></div></div>
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
  const names = Object.keys(store.data.修女);
  const name = names.includes(selected.value) ? selected.value : names[0];
  return name ? { name, data: store.data.修女[name] } : null;
});
const currentName = computed(() => current.value?.name ?? '');
</script>

<style lang="scss" scoped>
@media (max-width: 560px) {
  .split {
    grid-template-columns: 1fr;
  }
}
</style>
