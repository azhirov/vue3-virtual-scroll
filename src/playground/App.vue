<script setup lang="ts">
import { ref } from 'vue'
import { AzVirtualScroll } from '../lib'
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const bgs = ['#f5faff', '#fff7ec', '#dffff4', '#ffd7df']
const height = ref(400);
const items = ref(Array.from(Array(1500)).map((_item, i) => {
  return {
    height: 50 + getRandomInt(10, 50),
    bg: bgs[i % bgs.length],
  }
}))
</script>

<template>
  <div>
    <button @click="height = height + 100">+100px</button>
    <az-virtual-scroll :default-item-height="65" :items="items" :scroll-debounce="10" :height-debounce="10" :style="{height: `${height}px`}">
      <template #item="{ item, index }">
        <div class="item" :style="{height: `${item.height}px`, background: `${item.bg}`}">
          {{ index + 1 }}
        </div>
      </template>
    </az-virtual-scroll>
  </div>
</template>

<style scoped>
.item {
  height: 65px;
  border-bottom: 1px solid #ccc;
}
.virtual-scroll-container {
  height: 400px;
  width: 300px;
}
</style>
