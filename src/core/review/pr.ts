import type { PrReviewOptions } from '../../utils/validators'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { run } from '../../services/gemini'
import { File } from '../../utils/fs'
import { Git } from '../../utils/git'
import { logger } from '../../utils/logger'
import { processAdditionalPrompts } from '../../utils/prompt'

// 获取当前文件的目录路径（ES 模块中的 __dirname 替代方案）
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 类型定义
interface ReviewEnvironment {
  reviewFiles: string
  reviewFilesDiff: string
  userDescription: string
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
 * 验证 Git 仓库和分支
 */
async function validateGitEnvironment(options: PrReviewOptions): Promise<void> {
  const isGitRepo = await Git.isGitRepository()
  if (!isGitRepo) {
    throw new Error('当前目录不是 Git 仓库')
  }

  const [sourceBranchExists, targetBranchExists] = await Promise.all([
    Git.branchExists(options.sourceBranch),
    Git.branchExists(options.targetBranch),
  ])

  if (!sourceBranchExists) {
    throw new Error(`源分支不存在: ${options.sourceBranch}`)
  }
  if (!targetBranchExists) {
    throw new Error(`目标分支不存在: ${options.targetBranch}`)
  }
}

/**
 * 获取并设置变更文件信息
 */
async function setupChangedFiles(options: PrReviewOptions): Promise<string> {
  const changedFiles = await Git.getChangedFiles(options.sourceBranch, options.targetBranch)
  logger.info(`发现 ${changedFiles.length} 个变更文件`)

  // 过滤掉被忽略的文件
  const filteredFiles = filterIgnoredFiles(changedFiles, options.ignores)
  logger.info(`过滤后剩余 ${filteredFiles.length} 个变更文件`)

  const reviewFiles = filteredFiles.join(',')
  process.env.REVIEW_FILES = reviewFiles
  logger.info(`设置 REVIEW_FILES: ${reviewFiles}`)

  return reviewFiles
}

/**
 * 获取并设置文件差异信息
 */
async function setupFileDiffs(options: PrReviewOptions): Promise<string> {
  const fileDiffs = await Git.getAllFileDiffs(options.sourceBranch, options.targetBranch)

  // 过滤掉被忽略的文件
  const filteredDiffs: Record<string, any> = {}
  for (const [filePath, diffInfo] of Object.entries(fileDiffs)) {
    const isIgnored = File.isFileIgnored(filePath, options.ignores)
    if (!isIgnored) {
      filteredDiffs[filePath] = diffInfo
    }
  }

  const reviewFilesDiff = JSON.stringify(filteredDiffs)
  process.env.REVIEW_FILES_DIFF = reviewFilesDiff
  logger.info(`设置 REVIEW_FILES_DIFF: ${reviewFilesDiff.length} 字符`)

  return reviewFilesDiff
}

/**
 * 生成用户描述信息
 */
async function generateUserDescription(options: PrReviewOptions): Promise<string> {
  const commits = await Git.getCommitsBetweenBranches(options.sourceBranch, options.targetBranch)

  if (commits.length === 0) {
    return '未找到 commit 信息'
  }

  // 过滤掉只修改被忽略文件的 commit
  const relevantCommits = []
  for (const commit of commits) {
    // 这里我们需要获取每个 commit 修改的文件列表
    // 由于 Git 工具类可能没有提供获取单个 commit 文件列表的方法
    // 我们暂时保留所有 commit，但记录警告
    relevantCommits.push(commit)
  }

  if (relevantCommits.length === 0) {
    return '未找到相关的 commit 信息（所有 commit 都只修改了被忽略的文件）'
  }

  const latestCommit = relevantCommits[0]
  let userDescription = `${latestCommit.message}\n\n作者: ${latestCommit.author}\n日期: ${latestCommit.date}`

  if (relevantCommits.length > 1) {
    userDescription += `\n\n本次 PR 包含 ${relevantCommits.length} 个 commit`
  }

  return userDescription
}

/**
 * 设置环境变量
 */
function setupEnvironmentVariables(env: ReviewEnvironment): void {
  process.env.REVIEW_FILES = env.reviewFiles
  process.env.REVIEW_FILES_DIFF = env.reviewFilesDiff
  process.env.USER_DESCRIPTION = env.userDescription
  process.env.ADDITIONAL_INSTRUCTIONS = env.additionalInstructions
  process.env.OUTPUT_FILE = env.outputFile
}

/**
 * 记录环境变量摘要（调试用）
 */
function logEnvironmentSummary(env: ReviewEnvironment): void {
  logger.debug('环境变量摘要:')
  logger.debug(`REVIEW_FILES: ${env.reviewFiles}`)
  logger.debug(`REVIEW_FILES_DIFF: ${env.reviewFilesDiff.substring(0, 100)}...`)
  logger.debug(`USER_DESCRIPTION: ${env.userDescription}`)
  logger.debug(`ADDITIONAL_INSTRUCTIONS: ${env.additionalInstructions}`)
  logger.debug(`OUTPUT_FILE: ${env.outputFile}`)
}

/**
 * 执行 Gemini Review
 */
async function executeGeminiReview(): Promise<string> {
  const promptFile = resolve(__dirname, 'prompt.txt')
  logger.debug(`Gemini 执行的 prompt 文件: ${promptFile}`)

  const reviewResult = await run(promptFile)
  logger.info(`Gemini 返回的 review 结果: ${reviewResult}`)

  return reviewResult
}

/**
 * 主函数：执行 PR Review
 */
export async function reviewPr(options: PrReviewOptions): Promise<void> {
  logger.info('开始 PR Review 流程')

  // 验证 Git 环境
  await validateGitEnvironment(options)

  // 并行获取所有必要信息
  const [reviewFiles, reviewFilesDiff, userDescription] = await Promise.all([
    setupChangedFiles(options),
    setupFileDiffs(options),
    generateUserDescription(options),
  ])

  // 处理额外提示（异步操作）
  const additionalInstructions = await processAdditionalPrompts(options.additionalPrompts)
  logger.info(`设置 ADDITIONAL_INSTRUCTIONS: ${additionalInstructions.length} 字符`)

  // 设置输出文件路径
  const outputFile = resolve(process.cwd(), options.output || 'review.md')

  // 构建环境变量对象
  const env: ReviewEnvironment = {
    reviewFiles,
    reviewFilesDiff,
    userDescription,
    additionalInstructions,
    outputFile,
  }

  // 设置环境变量
  setupEnvironmentVariables(env)
  logger.success('PR Review 环境变量设置完成')

  // 记录环境变量摘要
  logEnvironmentSummary(env)

  // 执行 Gemini Review
  await executeGeminiReview()

  // 一般不需要输出， Gemini 的 Prompt 已经要求输出了，再输出会覆盖掉原有的 review 内容
  // // 输出 review 结果
  // return writeFile(new URL(options.output || 'review.md', import.meta.url), reviewResult)
}
