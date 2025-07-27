#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { Command } from 'commander'
import { GeminiService } from '../core/gemini-service.js'
import { logger } from '../utils/logger.js'
import { shell } from '../utils/shell.js'
import { Validators } from '../utils/validators.js'

const program = new Command()

program
  .name('gemini-tools')
  .description('Gemini AI 工具集合 - 聊天、代码生成、代码分析、Shell 执行')
  .version('1.0.0')

program
  .option('-m, --mode <mode>', '运行模式 (chat|code|analyze|shell)', 'chat')
  .option('-p, --prompt <prompt>', '输入提示或消息')
  .option('-f, --file <file>', '文件路径')
  .option('-l, --language <language>', '编程语言')
  .option('-o, --output <output>', '输出文件路径')
  .option('-t, --type <type>', '分析类型 (complexity|security|performance|style|comprehensive)', 'comprehensive')
  .option('-s, --safe', '安全模式（Shell 执行时确认）')
  .action(async (options: any) => {
    try {
      // 检查 gemini-cli 是否可用
      const isAvailable = await GeminiService.checkAvailability()
      if (!isAvailable) {
        logger.error('gemini-cli 不可用，请先安装: npm install -g gemini-cli')
        process.exit(1)
      }

      const service = new GeminiService()

      switch (options.mode) {
        case 'chat':
          await handleChat(service, options)
          break
        case 'code':
          await handleCode(service, options)
          break
        case 'analyze':
          await handleAnalyze(service, options)
          break
        case 'shell':
          await handleShell(service, options)
          break
        default:
          logger.error('无效的模式，请使用: chat, code, analyze, shell')
          process.exit(1)
      }
    }
    catch (error) {
      logger.error('工具执行失败:', error)
      process.exit(1)
    }
  })

async function handleChat(service: GeminiService, options: any): Promise<void> {
  if (!options.prompt) {
    logger.error('请提供消息内容 (-p, --prompt)')
    process.exit(1)
  }

  const validation = Validators.validateInputText(options.prompt)
  if (!validation.success) {
    logger.error(`无效的消息内容: ${validation.error}`)
    process.exit(1)
  }

  try {
    const response = await service.chat(options.prompt)
    logger.info(response.content)
  }
  catch (error) {
    logger.error('聊天失败:', error)
    process.exit(1)
  }
}

async function handleCode(service: GeminiService, options: any): Promise<void> {
  if (!options.prompt) {
    logger.error('请提供代码生成提示 (-p, --prompt)')
    process.exit(1)
  }

  try {
    const response = await service.generateCode(options.prompt, options.language)

    if (options.output) {
      const outputDir = path.dirname(options.output)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      fs.writeFileSync(options.output, response.content)
      logger.success(`代码已保存到: ${options.output}`)
    }
    else {
      logger.info(response.content)
    }
  }
  catch (error) {
    logger.error('代码生成失败:', error)
    process.exit(1)
  }
}

async function handleAnalyze(service: GeminiService, options: any): Promise<void> {
  if (!options.file && !options.prompt) {
    logger.error('请提供文件路径 (-f, --file) 或代码内容 (-p, --prompt)')
    process.exit(1)
  }

  let code = ''
  const language = options.language || ''

  if (options.file) {
    try {
      code = fs.readFileSync(options.file, 'utf-8')
    }
    catch (error) {
      logger.error('读取文件失败:', error)
      process.exit(1)
    }
  }
  else {
    code = options.prompt
  }

  try {
    const response = await service.analyzeCode(code, language)
    logger.info(response.content)
  }
  catch (error) {
    logger.error('代码分析失败:', error)
    process.exit(1)
  }
}

async function handleShell(service: GeminiService, options: any): Promise<void> {
  if (!options.prompt) {
    logger.error('请提供命令描述 (-p, --prompt)')
    process.exit(1)
  }

  try {
    const response = await service.chat(
      `请根据以下描述生成一个 shell 命令，只返回命令本身，不要包含任何解释：\n${options.prompt}`,
    )

    const command = response.content.trim()
    logger.info(`生成的命令: ${command}`)

    if (options.safe) {
      logger.info('安全模式：命令已生成但未执行')
    }
    else {
      const result = await shell.execute(command)
      if (result.success) {
        logger.success('命令执行成功')
        if (result.stdout)
          logger.info(result.stdout)
      }
      else {
        logger.error('命令执行失败')
        if (result.stderr)
          logger.error(result.stderr)
      }
    }
  }
  catch (error) {
    logger.error('生成命令失败:', error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse()
}
