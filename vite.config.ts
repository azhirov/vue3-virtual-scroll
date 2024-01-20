import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js"

export default defineConfig({
  plugins: [vue(), dts(), cssInjectedByJsPlugin()],
  resolve: {
    alias: {
      /*
       * We recommend to not use aliases in the lib's source,
       * because they will leak into the generated d.ts files and then
       * break the lib's types in the consuming app.
       */
    },
  },
  build: {
    lib: {
      name: 'Vue3VirtualScroll', // TODO: CHANGE_ME
      entry: fileURLToPath(new URL('./src/lib/index.ts', import.meta.url)),
      formats: ['es', 'cjs', 'iife'],
      fileName: (format) => {
        switch (format) {
          case 'es':
            return 'index.mjs'
          case 'cjs':
            return 'index.cjs'
          case 'iife':
            return 'index.js'
          default:
            return 'index.js'
        }
      },
    },
    minify: false,
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
