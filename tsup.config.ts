import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/bin/index.ts'],
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    outDir: 'dist/bin',
    target: 'node20',
    platform: 'node',
    outExtension({ format: _format }) {
      return {
        js: '.js',
      }
    },
    esbuildOptions(options) {
      options.banner = {
        js: '#!/usr/bin/env node',
      }
    },
  },
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
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
