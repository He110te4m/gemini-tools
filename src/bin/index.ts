#!/usr/bin/env node

import process from 'node:process'
import { Command } from 'commander'
import pkg from '../../package.json' with { type: 'json' }
import { reviewModule } from '../core/review/module'
import { reviewPr } from '../core/review/pr'
import { unitTest } from '../core/test/unit'
import { Validators } from '../utils/validators'

const program = new Command()

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version)

// 根据 diff review 代码
program.command('pr-review')
  .description('Review PR')
  .requiredOption('-s, --source-branch <sourceBranch>', '源分支名称')
  .requiredOption('-t, --target-branch <targetBranch>', '目标分支名称')
  .option('-o, --output <output>', '输出文件路径')
  .option('-m, --model <model>', '模型名称，默认使用环境变量 GEMINI_MODEL')
  .option('--additional-prompts <additionalPrompts...>', '自定义提示词，用于补充项目信息以及自定义 review 规则')
  .option('--ignore <ignores...>', '忽略文件路径（支持多个文件）')
  .action(async (options: unknown) => {
    // 验证输入参数
    const validation = Validators.validatePrReviewOptions(options)
    if (!validation.success) {
      globalThis.console.error(`参数验证失败: ${validation.error}`)
      process.exit(1)
    }

    const { data } = validation

    try {
      // 调用 PR review 函数
      await reviewPr(data)
    }
    catch (error) {
      globalThis.console.error(`PR Review 执行失败: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  })

// 根据模块 review 代码
program.command('module-review')
  .description('Review 代码')
  .requiredOption('-i, --input <inputs...>', '输入文件路径（支持多个文件）')
  .option('-o, --output <output>', '输出文件路径')
  .option('-m, --model <model>', '模型名称，默认使用环境变量 GEMINI_MODEL')
  .option('--additional-prompts <additionalPrompts...>', '自定义提示词，用于补充项目信息以及自定义 review 规则')
  .option('--ignore <ignores...>', '忽略文件路径（支持多个文件）')
  .action(async (options: unknown) => {
    // 验证输入参数
    const validation = Validators.validateModuleReviewOptions(options)
    if (!validation.success) {
      globalThis.console.error(`参数验证失败: ${validation.error}`)
      process.exit(1)
    }

    const { data } = validation

    try {
      // 调用 Module review 函数
      await reviewModule(data)
    }
    catch (error) {
      globalThis.console.error(`Module Review 执行失败: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  })

program.command('unit-test')
  .description('生成单元测试')
  .requiredOption('-i, --input <input>', '输入路径（文件或目录），目录将递归处理所有文件')
  .requiredOption('-o, --output <output>', '输出文件路径')
  .option('-m, --model <model>', '模型名称，默认使用环境变量 GEMINI_MODEL')
  .option('--additional-prompts <additionalPrompts...>', '自定义提示词，用于补充项目信息以及自定义测试生成规则')
  .option('--ignore <ignores...>', '忽略文件模式（支持 glob 模式，如 *.test.js, node_modules/**）')
  .action(async (options: unknown) => {
    const validation = Validators.validateUnitTestOptions(options)
    if (!validation.success) {
      globalThis.console.error(`参数验证失败: ${validation.error}`)
      process.exit(1)
    }

    const { data } = validation

    try {
      // 调用单元测试生成函数
      await unitTest(data)
    }
    catch (error) {
      globalThis.console.error(`单元测试生成执行失败: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
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
