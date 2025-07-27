#!/usr/bin/env node

import { Command } from 'commander'
import pkg from '../../package.json' with { type: 'json' }

const program = new Command()

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version)

// 根据 diff review 代码
program.command('pr-review')
  .description('Review PR')
  .option('--additional-prompts <additionalPrompts...>', '自定义提示词，用于补充项目信息以及自定义 review 规则')
  .requiredOption('-s, --source-branch <sourceBranch>', '源分支名称')
  .requiredOption('-t, --target-branch <targetBranch>', '目标分支名称')
  .option('-o, --output <output>', '输出文件路径')
  .option('-m, --model <model>', '模型名称，默认使用环境变量 GEMINI_MODEL')
  .action(async (_options: unknown) => {
    globalThis.console.log('Review PR')
  })

// 根据模块 review 代码
program.command('module-review')
  .description('Review 代码')
  .option('--additional-prompts <additionalPrompts...>', '自定义提示词，用于补充项目信息以及自定义 review 规则')
  .option('--ignore <ignores...>', '忽略文件路径（支持多个文件）')
  .requiredOption('-i, --input <inputs...>', '输入文件路径（支持多个文件）')
  .option('-o, --output <output>', '输出文件路径')
  .option('-m, --model <model>', '模型名称，默认使用环境变量 GEMINI_MODEL')
  .action(async (_options: unknown) => {
    globalThis.console.log('Review module')
  })

program.command('unit-test')
  .description('生成单元测试')
  .argument('<file>', '文件路径')
  .option('-o, --output <output>', '输出文件路径')
  .action(async () => {
    globalThis.console.log('生成单元测试')
  })

program.command('e2e-test')
  .description('生成 E2E 测试')
  .argument('<file>', '文件路径')
  .option('-o, --output <output>', '输出文件路径')
  .action(async () => {
    globalThis.console.log('生成 E2E 测试')
  })

program.command('doc')
  .description('生成项目文档')
  .argument('<file>', '文件路径')
  .option('-o, --output <output>', '输出文件路径')
  .action(async () => {
    globalThis.console.log('生成项目文档')
  })

program.command('refactor')
  .description('代码重构')
  .argument('<file>', '文件路径')
  .option('-o, --output <output>', '输出文件路径')
  .action(async () => {
    globalThis.console.log('代码重构')
  })

program.parse()
