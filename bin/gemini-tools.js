#!/usr/bin/env node

/**
 * CLI 入口文件
 * 直接调用 tsx 执行 TypeScript 代码
 */

import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 获取 TypeScript 入口文件路径
const tsEntryPath = resolve(__dirname, '../src/bin/index.ts')

try {
  // 使用 tsx 执行 TypeScript 文件
  // 安全地传递参数，避免 shell 注入
  const args = process.argv.slice(2)

  // 使用 spawn 来执行命令
  const child = spawn('npx', ['tsx', tsEntryPath, ...args], {
    stdio: 'inherit',
    shell: false,
  })

  child.on('error', (error) => {
    console.error('执行失败:', error.message)
    process.exit(1)
  })

  child.on('exit', (code) => {
    if (code !== 0) {
      process.exit(code || 1)
    }
  })
}
catch (error) {
  console.error('Debug: 执行失败:', error.message)
  console.error('Debug: 错误代码:', error.status)
  process.exit(error.status || 1)
}
