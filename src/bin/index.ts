#!/usr/bin/env node

import { Command } from 'commander'
import pkg from '../../package.json' with { type: 'json' }

const program = new Command()

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version)

program.command('review')
  .description('Review 代码')
  .argument('<file>', '文件路径')
  .option('-o, --output <output>', '输出文件路径')
  .action(async () => {
    console.log('Review 代码')
  })

program.command('unit-test')
  .description('生成单元测试')
  .argument('<file>', '文件路径')
  .option('-o, --output <output>', '输出文件路径')
  .action(async () => {
    console.log('生成单元测试')
  })

program.command('e2e-test')
  .description('生成 E2E 测试')
  .argument('<file>', '文件路径')
  .option('-o, --output <output>', '输出文件路径')
  .action(async () => {
    console.log('生成 E2E 测试')
  })

program.command('doc')
  .description('生成项目文档')
  .argument('<file>', '文件路径')
  .option('-o, --output <output>', '输出文件路径')
  .action(async () => {
    console.log('生成项目文档')
  })

program.command('refactor')
  .description('代码重构')
  .argument('<file>', '文件路径')
  .option('-o, --output <output>', '输出文件路径')
  .action(async () => {
    console.log('代码重构')
  })

program.parse()
