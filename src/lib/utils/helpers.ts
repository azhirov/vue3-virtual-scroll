import type { ComponentPublicInstance, MaybeRef } from 'vue'
import { unref } from 'vue'

export function debounce (fn: Function, delay: MaybeRef<number>) {
  let timeoutId = 0 as any
  const wrap = (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), unref(delay))
  }
  wrap.clear = () => {
    clearTimeout(timeoutId)
  }
  wrap.immediate = fn
  return wrap
}

export function clamp (value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

export function findClosestSmaller(target: number, arr: number[]): number {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] < target) {
      // Обновляем результат и ищем дальше в правой части массива
      result = mid;
      left = mid + 1;
    } else {
      // Ищем в левой части массива
      right = mid - 1;
    }
  }

  return result;
}

export function refElement (obj?: ComponentPublicInstance<any> | HTMLElement): HTMLElement | undefined {
  if (obj && '$el' in obj) {
    const el = obj.$el as HTMLElement
    if (el?.nodeType === Node.TEXT_NODE) {
      // Multi-root component, use the first element
      return el.nextElementSibling as HTMLElement
    }
    return el
  }
  return obj as HTMLElement
}
