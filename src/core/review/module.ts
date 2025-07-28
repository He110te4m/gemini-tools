import type { ModuleReviewOptions } from '../../utils/validators'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { run } from '../../services/gemini'
import { File } from '../../utils/fs'
import { logger } from '../../utils/logger'
import { processAdditionalPrompts } from '../../utils/prompt'

// 获取当前文件的目录路径（ES 模块中的 __dirname 替代方案）
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 类型定义
interface ModuleReviewEnvironment {
  reviewFiles: string
  additionalInstructions: string
  outputFile: string
}

/**
 * 过滤文件列表，移除被忽略的文件
 */
function filterIgnoredFiles(files: string[], ignorePatterns?: string[]): string[] {
  if (!ignorePatterns || ignorePatterns.length === 0) {
    return files
  }

  const filteredFiles = files.filter(file => !File.isFileIgnored(file, ignorePatterns))

  if (filteredFiles.length !== files.length) {
    const ignoredCount = files.length - filteredFiles.length
    logger.info(`忽略 ${ignoredCount} 个文件（基于 ignores 配置）`)
  }

  return filteredFiles
}

/**
 * 验证输入文件是否存在
 */
async function validateInputFiles(filePaths: string[]): Promise<void> {
  const validationPromises = filePaths.map(async (filePath) => {
    const exists = await File.fileExists(filePath)
    if (!exists) {
      throw new Error(`文件不存在: ${filePath}`)
    }
    return filePath
  })

  await Promise.all(validationPromises)
  logger.info(`验证完成，所有 ${filePaths.length} 个输入文件都存在`)
}

/**
 * 获取并设置文件列表信息
 */
async function setupFileList(options: ModuleReviewOptions): Promise<string> {
  // 处理输入文件，支持通配符和目录
  const allFiles: string[] = []
  const input = options.input

  const pathType = await File.getPathType(input)

  if (pathType === 'file') {
    // 对于单个文件，检查是否被忽略
    if (!File.isFileIgnored(input, options.ignores)) {
      allFiles.push(input)
    }
    else {
      logger.debug(`忽略文件: ${input}`)
    }
  }
  else if (pathType === 'directory') {
    // 对于目录，File.readDirectoryFiles 已经处理了 ignores
    const dirFiles = await File.readDirectoryFiles(input, options.ignores)
    allFiles.push(...dirFiles)
  }
  else {
    throw new Error(`路径不存在: ${input}`)
  }

  // 去重
  const uniqueFiles = [...new Set(allFiles)]
  logger.info(`发现 ${uniqueFiles.length} 个文件`)

  // 再次过滤掉被忽略的文件（双重保险）
  const filteredFiles = filterIgnoredFiles(uniqueFiles, options.ignores)
  logger.info(`过滤后剩余 ${filteredFiles.length} 个文件`)

  const reviewFiles = filteredFiles.join(',')
  process.env.REVIEW_FILES = reviewFiles
  logger.info(`设置 REVIEW_FILES: ${reviewFiles}`)

  return reviewFiles
}

/**
 * 设置环境变量
 */
function setupEnvironmentVariables(env: ModuleReviewEnvironment): void {
  process.env.REVIEW_FILES = env.reviewFiles
  process.env.ADDITIONAL_INSTRUCTIONS = env.additionalInstructions
  process.env.OUTPUT_FILE = env.outputFile
}

/**
 * 记录环境变量摘要（调试用）
 */
function logEnvironmentSummary(env: ModuleReviewEnvironment): void {
  logger.debug('环境变量摘要:')
  logger.debug(`REVIEW_FILES: ${env.reviewFiles}`)
  logger.debug(`ADDITIONAL_INSTRUCTIONS: ${env.additionalInstructions}`)
  logger.debug(`OUTPUT_FILE: ${env.outputFile}`)
}

/**
 * 执行 Gemini Review
 */
async function executeGeminiReview(): Promise<string> {
  const promptFile = resolve(__dirname, 'module-review-prompt.txt')
  logger.debug(`Gemini 执行的 prompt 文件: ${promptFile}`)

  const reviewResult = await run(promptFile)
  logger.info(`Gemini 返回的 review 结果: ${reviewResult}`)

  return reviewResult
}

/**
 * 主函数：执行模块 Review
 */
export async function reviewModule(options: ModuleReviewOptions): Promise<void> {
  logger.info('开始模块 Review 流程')

  // 验证输入文件
  await validateInputFiles([options.input])

  // 获取文件列表（包含过滤）
  const reviewFiles = await setupFileList(options)

  // 处理额外提示（异步操作）
  const additionalInstructions = await processAdditionalPrompts(options.additionalPrompts)
  logger.info(`设置 ADDITIONAL_INSTRUCTIONS: ${additionalInstructions.length} 字符`)

  // 设置输出文件路径
  const outputFile = resolve(process.cwd(), options.output || 'module-review.md')

  // 构建环境变量对象
  const env: ModuleReviewEnvironment = {
    reviewFiles,
    additionalInstructions,
    outputFile,
  }

  // 设置环境变量
  setupEnvironmentVariables(env)
  logger.success('模块 Review 环境变量设置完成')

  // 记录环境变量摘要
  logEnvironmentSummary(env)

  // 执行 Gemini Review
  await executeGeminiReview()
}
