<script setup lang="ts">
import { useResizeObserver } from '../composables/resizeObserver'
import { watch } from 'vue'

defineOptions({
  name: 'AzVirtualScrollItem'
})

const emit = defineEmits<{
  'update:height': [height: number],
}>()

const { contentRect, resizeRef } = useResizeObserver(undefined, 'border')
watch(() => contentRect.value?.height, height => {
  if (height != null) emit('update:height', height)
})
</script>

<template>
<div ref="resizeRef" class="vlist-item"><slot></slot></div>
</template>

<style scoped>

</style>
