<template>
  <span class="avatar" :class="size" :style="{ '--tint': tint }">
    <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
      <path d="M32 11a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
      <path d="M13 64c0-15 8-23 19-23s19 8 19 23z" />
    </svg>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ name: string; size?: '' | 'xs' | 'lg' }>(), { size: '' });

const PALETTE = ['#8fb3c9', '#d4a860', '#7fb0a0', '#9c78c0', '#b05662', '#9a97a6'];

function hash(str: string): number {
  let h = 0;
  for (const ch of str) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return h;
}

const tint = PALETTE[hash(props.name) % PALETTE.length];
</script>
