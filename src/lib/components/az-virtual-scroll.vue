<template>
  <div
    ref="scrollContainer"
    class="virtual-scroll-container"
    @scroll.passive="debouncedHandleScroll"
  >
    <div :style="{ height: `${totalHeight}px`}" v-if="visibleItems.length > 0">
      <div
        class="spacer"
        :style="spacerStyle"
      >
      <template
        v-for="item in visibleItems"
        :key="item.index"
      >
        <az-virtual-scroll-item @update:height="handleResize(item.index, $event)">
          <slot
            name="item"
            :item="item.raw"
            :index="item.index"
          >
          </slot>
        </az-virtual-scroll-item>
      </template>
    </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, shallowRef, type StyleValue, watch } from 'vue'
import { clamp, findClosestSmaller, debounce } from '../utils/helpers'
import { useResizeObserver } from '../composables/resizeObserver'
import AzVirtualScrollItem from './az-virtual-scroll-item.vue'

interface Item {
  index: number;
  raw: any;
}

defineOptions({
  name: 'AzVirtualScroll'
})

const props = withDefaults(defineProps<{
  items: any[],
  /**
   * Высота элемента списка по умолчанию.
   * Рекомендуется указывать МИНИМАЛЬНУЮ высоту, чтобы избежать пустого пространства
   */
  defaultItemHeight: number,
  /**
   * Высота "буферной" зоны сверху и снизу от viewport
   */
  buffer?: number,
  scrollDebounce?: number,
  heightDebounce?: number,
}>(), {
  buffer: 200,
  scrollDebounce: 50,
  heightDebounce: 50
});

const itemsCount = computed(() => props.items.length);
const viewportHeight = ref(0)
const totalHeight = ref(0)
const { contentRect, resizeRef: scrollContainer } = useResizeObserver(undefined, 'border');

const heights = ref<number[]>(Array.from(Array(props.items.length)));
const offsets = ref(Array.from(Array(props.items.length)))

const offsetTop = ref(0)
const scrollTop = ref(0);

const firstItemIndex = shallowRef(0)
const lastItemIndex = shallowRef(0)

const getItemHeight = (index: number) => {
  return heights.value[index] || props.defaultItemHeight || 0
}

const calculateHeight = () => {
  let arr: number[] = [0]
  for (let i = 1; i <= itemsCount.value - 1; i += 1) {
    arr.push(arr[i - 1] + getItemHeight(i - 1))
  }
  offsets.value = arr;
  totalHeight.value = (offsets.value[itemsCount.value - 1] || 0) + getItemHeight(itemsCount.value - 1)
}

const updatePosition = () => {
  const firstPx = Math.max(0, scrollTop.value - props.buffer);
  const lastPx = scrollTop.value + viewportHeight.value + props.buffer;
  firstItemIndex.value = clamp(findClosestSmaller(firstPx, offsets.value), 0, props.items.length);
  lastItemIndex.value = clamp(
    findClosestSmaller(lastPx, offsets.value) + 1,
    firstItemIndex.value,
    itemsCount.value - 1
  )

  offsetTop.value = offsets.value[firstItemIndex.value] ?? 0
}

const visibleItems = computed<Item[]>(
  () => props.items
    .slice(firstItemIndex.value, lastItemIndex.value + 1)
    .map((item, index) => ({
      index: firstItemIndex.value + index,
      raw: item,
    }))
)

const spacerStyle = computed<StyleValue>(() => ({
  transform: `translateY(${offsetTop.value}px)`
}))

let animationFrame = -1;
const handleScroll = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  animationFrame = requestAnimationFrame(() => {
    scrollTop.value = scrollContainer.value?.scrollTop || 0;
  })
};

const scrollDebounceRef = computed(() => props.scrollDebounce);
const heightDebounceRef = computed(() => props.heightDebounce);
const debouncedHandleScroll = debounce(handleScroll, scrollDebounceRef);

const recalculateHeightAndPosition = debounce(() => {
  calculateHeight()
  updatePosition()
}, heightDebounceRef)

const handleResize = (index: number, height: number) => {
  if (getItemHeight(index) === height) return;

  heights.value[index] = height
  recalculateHeightAndPosition()
}

onMounted(() => {
  viewportHeight.value = scrollContainer.value?.clientHeight ?? 0
  calculateHeight()
});

watch(() => props.items, (newItems) => {
  heights.value = Array.from(Array(newItems.length))
  calculateHeight()
}, { deep: true });

watch(scrollTop, () => {
  updatePosition()
})

watch(() => contentRect.value?.height, height => {
  viewportHeight.value = height ?? 0
  recalculateHeightAndPosition()
})

onUnmounted(() => {
  debouncedHandleScroll.clear();
});
</script>

<style scoped>
.virtual-scroll-container {
  overflow-y: auto;
}
</style>
