import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    outDir: 'dist',
    target: 'node20',
    platform: 'node',
    outExtension({ format: _format }) {
      return {
        js: '.js',
      }
    },
  },
])
