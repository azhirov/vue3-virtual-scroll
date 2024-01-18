/** https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/composables/resizeObserver.ts */

// Utilities
import { onBeforeUnmount, readonly, ref, watch } from 'vue'
import { refElement } from '@/utils/helpers'

// Types
import type { DeepReadonly, Ref } from 'vue'

interface ResizeState {
  resizeRef: Ref<HTMLElement | undefined>
  contentRect: DeepReadonly<Ref<DOMRectReadOnly | undefined>>
}

export function useResizeObserver (callback?: ResizeObserverCallback, box: 'content' | 'border' = 'content'): ResizeState {
  const resizeRef = ref<HTMLElement>()
  const contentRect = ref<DOMRectReadOnly>()

  if (typeof window !== 'undefined') {
    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      callback?.(entries, observer)

      if (!entries.length) return

      if (box === 'content') {
        contentRect.value = entries[0].contentRect
      } else {
        contentRect.value = entries[0].target.getBoundingClientRect()
      }
    })

    onBeforeUnmount(() => {
      observer.disconnect()
    })

    watch(resizeRef, (newValue, oldValue) => {
      if (oldValue) {
        observer.unobserve(refElement(oldValue) as Element)
        contentRect.value = undefined
      }

      if (newValue) observer.observe(refElement(newValue) as Element)
    }, {
      flush: 'post',
    })
  }

  return {
    resizeRef,
    contentRect: readonly(contentRect),
  }
}
