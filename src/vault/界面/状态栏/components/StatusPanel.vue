<template>
  <div class="status-grid">
    <div class="resource-card food">
      <div class="rc-head">
        <span class="rc-icon" v-html="ICONS.food"></span>
        <div>
          <div class="rc-title">食物量</div>
          <div class="rc-sub">FOOD SUPPLY</div>
        </div>
      </div>
      <div class="rc-bignum"><b>{{ store.data.队伍状态.食物量 }}</b><i>/ 200</i></div>
      <div class="bar"><div class="bar-fill life" :style="{ width: foodPct + '%' }"></div></div>
    </div>

    <div class="resource-card stock">
      <div class="rc-head">
        <span class="rc-icon" v-html="ICONS.flask"></span>
        <div>
          <div class="rc-title">淫魔精液总存量</div>
          <div class="rc-sub">TOTAL RESERVE</div>
        </div>
      </div>
      <div class="rc-bignum"><b>{{ store.data.队伍状态.淫魔精液总存量 }}</b><i>/ 500</i></div>
      <div class="bar"><div class="bar-fill violet" :style="{ width: stockPct + '%' }"></div></div>
    </div>

    <div class="aggregate">
      <div class="section-title">队伍概览</div>
      <div class="agg-row">
        <div class="mini-stat">
          <div class="mini-stat-top"><span class="stat-row-name">全队生命</span><span class="stat-row-value">{{ totalHp }}<i>/ {{ hpMax }}</i></span></div>
          <div class="bar"><div class="bar-fill life" :style="{ width: (totalHp / hpMax) * 100 + '%' }"></div></div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-top"><span class="stat-row-name">平均压力</span><span class="stat-row-value">{{ avgPressure }}<i>/ 100</i></span></div>
          <div class="bar"><div class="bar-fill pressure" :style="{ width: avgPressure + '%' }"></div></div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-top"><span class="stat-row-name">最高浊化</span><span class="stat-row-value">{{ maxCorruption }}<i>/ 5</i></span></div>
          <div class="bar"><div class="bar-fill crimson" :style="{ width: (maxCorruption / 5) * 100 + '%' }"></div></div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-top"><span class="stat-row-name">修女平均耐受</span><span class="stat-row-value">{{ avgTolerance }}<i>/ 100</i></span></div>
          <div class="bar"><div class="bar-fill ice" :style="{ width: avgTolerance + '%' }"></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ICONS } from '../icons';
import { useDataStore } from '../store';

const store = useDataStore();

const foodPct = computed(() => (store.data.队伍状态.食物量 / 200) * 100);
const stockPct = computed(() => (store.data.队伍状态.淫魔精液总存量 / 500) * 100);

const members = computed(() => Object.values(store.data.队伍人员));
const nuns = computed(() => Object.values(store.data.修女));

const totalHp = computed(() => members.value.reduce((s, m) => s + m.生命值, 0));
const hpMax = computed(() => members.value.length * 100);
const avgPressure = computed(() =>
  members.value.length ? Math.round(members.value.reduce((s, m) => s + m.压力值, 0) / members.value.length) : 0,
);
const maxCorruption = computed(() => (members.value.length ? Math.max(...members.value.map((m) => m.浊化等级)) : 0));
const avgTolerance = computed(() =>
  nuns.value.length ? Math.round(nuns.value.reduce((s, n) => s + n.身体耐受值, 0) / nuns.value.length) : 0,
);
</script>

<style lang="scss" scoped>
.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.resource-card {
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: linear-gradient(160deg, rgba(230, 226, 216, 0.03), transparent);
}
.rc-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.rc-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: rgba(230, 226, 216, 0.05);
  border: 1px solid var(--line);
  font-family: var(--font-serif);
}
.food .rc-icon {
  color: var(--life);
}
.stock .rc-icon {
  color: var(--violet);
}
.rc-title {
  font-family: var(--font-serif);
  font-size: 14px;
  letter-spacing: 0.06em;
}
.rc-sub {
  font-family: var(--font-display);
  font-size: 9px;
  letter-spacing: 0.18em;
  color: var(--ash-faint);
}
.rc-bignum {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 8px;
}
.rc-bignum b {
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
}
.rc-bignum i {
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--ash-dim);
  font-style: normal;
}
.aggregate {
  grid-column: 1 / -1;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(230, 226, 216, 0.02);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.agg-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.mini-stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mini-stat-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
@media (max-width: 560px) {
  .status-grid,
  .agg-row {
    grid-template-columns: 1fr;
  }
  .aggregate {
    grid-column: auto;
  }
}
</style>
