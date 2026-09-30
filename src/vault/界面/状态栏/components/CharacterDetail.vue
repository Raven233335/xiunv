<template>
  <div class="detail-overlay" @click.self="$emit('close')">
    <div class="detail-panel">
      <div class="detail-head">
        <div class="detail-title-wrap">
          <span class="detail-name">{{ target.name }}</span>
          <span class="detail-meta">{{ data.性别 }} · {{ data.年龄 }} 岁</span>
        </div>
        <button class="detail-close" aria-label="关闭" @click="$emit('close')">
          <span v-html="ICONS.close"></span>
        </button>
      </div>

      <div v-if="data" class="detail-body">
        <!-- 队员详情 -->
        <template v-if="target.type === 'member'">
          <div class="section-title">描述</div>
          <div class="desc-list">
            <div class="desc-item"><i>外貌</i>{{ data.外貌 }}</div>
            <div class="desc-item"><i>背景</i>{{ data.背景 }}</div>
            <div class="desc-item"><i>浊化表现</i>{{ data.浊化表现 }}</div>
          </div>

          <div class="section-title">核心数值</div>
          <div class="stats-list">
            <div class="stat-row">
              <div class="stat-row-top">
                <span class="stat-row-name"><span class="icon" v-html="ICONS.pressure"></span>压力值</span>
                <span class="stat-row-value">{{ data.压力值 }}<i>/ 100</i></span>
              </div>
              <div class="bar"><div class="bar-fill pressure" :style="{ width: data.压力值 + '%' }"></div></div>
            </div>
            <div class="stat-row">
              <div class="stat-row-top">
                <span class="stat-row-name"><span class="icon" v-html="ICONS.drop"></span>精液存量</span>
                <span class="stat-row-value">{{ data.精液存量 }}<i> ml</i></span>
              </div>
              <div class="bar"><div class="bar-fill ice" :style="{ width: Math.min((data.精液存量 / 200) * 100, 100) + '%' }"></div></div>
            </div>
          </div>

          <div class="section-title">生存状态</div>
          <div class="stats-list">
            <div class="stat-row">
              <div class="stat-row-top">
                <span class="stat-row-name"><span class="icon" v-html="ICONS.hp"></span>生命值</span>
                <span class="stat-row-value">{{ data.生命值 }}<i>/ 100</i></span>
              </div>
              <div class="bar"><div class="bar-fill life" :style="{ width: data.生命值 + '%' }"></div></div>
            </div>
            <div class="stat-row">
              <div class="stat-row-top">
                <span class="stat-row-name"><span class="icon" v-html="ICONS.corruption"></span>浊化等级</span>
                <span class="stat-row-value">{{ data.浊化等级 }}<i>/ 5</i></span>
              </div>
              <div class="pips">
                <span v-for="i in 5" :key="i" class="pip crimson" :class="{ on: i <= data.浊化等级 }"></span>
                <span class="pips-num">{{ data.浊化等级 }} / 5</span>
              </div>
            </div>
          </div>
        </template>

        <!-- 修女详情 -->
        <template v-else>
          <div class="section-title">描述</div>
          <div class="desc-list">
            <div class="desc-item"><i>外貌</i>{{ data.外貌 }}</div>
            <div class="desc-item"><i>背景</i>{{ data.背景 }}</div>
          </div>

          <div class="section-title">淫匣</div>
          <div class="yinxia-box">
            <div class="desc-item"><i>名字</i>{{ data.淫匣.名字 }}</div>
            <div class="desc-item"><i>机芯形态</i>{{ data.淫匣.机芯形态 }}</div>
            <div class="desc-item"><i>外表描述</i>{{ data.淫匣.外表描述 }}</div>
          </div>

          <div class="section-title">核心数值</div>
          <div class="stats-list">
            <div class="stat-row">
              <div class="stat-row-top">
                <span class="stat-row-name"><span class="icon" v-html="ICONS.succubus"></span>淫魔精液量</span>
                <span class="stat-row-value">{{ data.淫魔精液量 }}<i>/ 100</i></span>
              </div>
              <div class="bar"><div class="bar-fill violet" :style="{ width: data.淫魔精液量 + '%' }"></div></div>
            </div>
            <div class="stat-row">
              <div class="stat-row-top">
                <span class="stat-row-name"><span class="icon" v-html="ICONS.mechanism"></span>机芯等级</span>
                <span class="stat-row-value">{{ data.机芯等级 }}<i>/ 5</i></span>
              </div>
              <div class="pips">
                <span v-for="i in 5" :key="i" class="pip violet" :class="{ on: i <= data.机芯等级 }"></span>
                <span class="pips-num">{{ data.机芯等级 }} / 5</span>
              </div>
            </div>
          </div>

          <div class="section-title">生存状态</div>
          <div class="stats-list">
            <div class="stat-row">
              <div class="stat-row-top">
                <span class="stat-row-name"><span class="icon" v-html="ICONS.endurance"></span>身体耐受值</span>
                <span class="stat-row-value">{{ data.身体耐受值 }}<i>/ 100</i></span>
              </div>
              <div class="bar"><div class="bar-fill crimson" :style="{ width: data.身体耐受值 + '%' }"></div></div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ICONS } from '../icons';
import { useDataStore } from '../store';

const props = defineProps<{ target: { type: 'member' | 'nun'; name: string } }>();
defineEmits<{ close: [] }>();

const store = useDataStore();

const data = computed(() => {
  if (props.target.type === 'member') return store.data.队伍人员[props.target.name];
  return store.data.修女[props.target.name];
});
</script>

<style lang="scss" scoped>
.detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
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
.detail-panel {
  width: min(560px, 100%);
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
.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
}
.detail-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.detail-name {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--bone);
}
.detail-meta {
  font-size: 12px;
  color: var(--ash-dim);
}
.detail-close {
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
.detail-close :deep(svg) {
  width: 15px;
  height: 15px;
}
.detail-close:hover {
  color: var(--bone);
  border-color: var(--line-bright);
  background: rgba(230, 226, 216, 0.06);
}
.detail-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  overflow-y: auto;
}
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
.desc-item i {
  font-style: normal;
  font-family: var(--font-serif);
  color: var(--ash-faint);
  letter-spacing: 0.12em;
  margin-right: 8px;
}
.yinxia-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border: 1px solid rgba(156, 120, 192, 0.25);
  border-radius: 12px;
  background: rgba(156, 120, 192, 0.06);
}
.yinxia-box .desc-item {
  border-color: rgba(156, 120, 192, 0.2);
}
</style>
