<template>
  <div class="overview">
    <div class="block">
      <div class="section-title">队伍状态</div>
      <div class="stat-row">
        <div class="stat-row-top">
          <span class="stat-row-name"><span class="icon" v-html="ICONS.food"></span>食物量</span>
          <span class="stat-row-value">{{ store.data.队伍状态.食物量 }}<i>/ 200</i></span>
        </div>
        <div class="bar"><div class="bar-fill life" :style="{ width: foodPct + '%' }"></div></div>
      </div>
      <div class="stat-row">
        <div class="stat-row-top">
          <span class="stat-row-name"><span class="icon" v-html="ICONS.flask"></span>淫魔精液总存量</span>
          <span class="stat-row-value">{{ store.data.队伍状态.淫魔精液总存量 }}<i>/ 500</i></span>
        </div>
        <div class="bar"><div class="bar-fill violet" :style="{ width: stockPct + '%' }"></div></div>
      </div>
    </div>

    <div class="block">
      <div class="section-title">队员</div>
      <div class="mini-list">
        <button v-for="(m, name) in store.data.队伍人员" :key="name" class="mini-card" @click="emit('select', 'member', name)">
          <Avatar :name="name" size="xs" />
          <span class="mini-name">{{ name }}</span>
          <span class="mini-live">生命 <b>{{ m.生命值 }}</b></span>
        </button>
      </div>
    </div>

    <div class="block">
      <div class="section-title">修女</div>
      <div class="mini-list">
        <button v-for="(n, name) in store.data.修女" :key="name" class="mini-card" @click="emit('select', 'nun', name)">
          <Avatar :name="name" size="xs" />
          <span class="mini-name">{{ name }}</span>
          <span class="mini-live">耐受 <b>{{ n.身体耐受值 }}</b></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Avatar from './Avatar.vue';
import { ICONS } from '../icons';
import { useDataStore } from '../store';

const emit = defineEmits<{ select: [type: 'member' | 'nun', name: string] }>();

const store = useDataStore();
const foodPct = computed(() => (store.data.队伍状态.食物量 / 200) * 100);
const stockPct = computed(() => (store.data.队伍状态.淫魔精液总存量 / 500) * 100);
</script>

<style lang="scss" scoped>
.overview {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 12px;
  min-height: 0;
}
.block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mini-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.mini-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 11px;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: rgba(230, 226, 216, 0.02);
  color: var(--bone);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}
.mini-card:hover {
  border-color: rgba(212, 168, 96, 0.45);
  background: rgba(212, 168, 96, 0.06);
  transform: translateX(2px);
}
.mini-name {
  font-family: var(--font-serif);
  font-size: 13.5px;
  color: var(--bone);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mini-live {
  font-size: 11px;
  color: var(--ash-dim);
  white-space: nowrap;
}
.mini-live b {
  font-family: var(--font-display);
  color: var(--life);
}
</style>
