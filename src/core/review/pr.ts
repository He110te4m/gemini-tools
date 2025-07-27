import type { PrReviewOptions } from '../../utils/validators'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { run } from '../../services/gemini'
import { File } from '../../utils/fs.js'
import { Git } from '../../utils/git.js'
import { logger } from '../../utils/logger.js'

export async function reviewPr(options: PrReviewOptions) {
  try {
    logger.info('开始 PR Review 流程')

    // 检查是否在 Git 仓库中
    const isGitRepo = await Git.isGitRepository()
    if (!isGitRepo) {
      throw new Error('当前目录不是 Git 仓库')
    }

    // 检查分支是否存在
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

    // 获取变更文件列表
    const changedFiles = await Git.getChangedFiles(options.sourceBranch, options.targetBranch)
    logger.info(`发现 ${changedFiles.length} 个变更文件`)

    // 生成 REVIEW_FILES 变量
    const reviewFiles = changedFiles.join(',')
    process.env.REVIEW_FILES = reviewFiles
    logger.info(`设置 REVIEW_FILES: ${reviewFiles}`)

    // 获取所有文件的 diff 信息
    const fileDiffs = await Git.getAllFileDiffs(options.sourceBranch, options.targetBranch)

    // 生成 REVIEW_FILES_DIFF 变量
    const reviewFilesDiff = JSON.stringify(fileDiffs)
    process.env.REVIEW_FILES_DIFF = reviewFilesDiff
    logger.info(`设置 REVIEW_FILES_DIFF: ${reviewFilesDiff.length} 字符`)

    // 获取 commit 信息并生成 USER_DESCRIPTION
    const commits = await Git.getCommitsBetweenBranches(options.sourceBranch, options.targetBranch)
    let userDescription = ''

    if (commits.length > 0) {
      // 使用最新的 commit 信息作为描述
      const latestCommit = commits[0]
      userDescription = `${latestCommit.message}\n\n作者: ${latestCommit.author}\n日期: ${latestCommit.date}`

      // 如果有多个 commit，添加摘要
      if (commits.length > 1) {
        userDescription += `\n\n本次 PR 包含 ${commits.length} 个 commit`
      }
    }
    else {
      userDescription = '未找到 commit 信息'
    }

    process.env.USER_DESCRIPTION = userDescription
    logger.info(`设置 USER_DESCRIPTION: ${userDescription}`)

    // 处理 additionalPrompts 并生成 ADDITIONAL_INSTRUCTIONS
    let additionalInstructions = ''

    if (options.additionalPrompts && options.additionalPrompts.length > 0) {
      const promptContents: string[] = []

      for (const promptFile of options.additionalPrompts) {
        try {
          if (File.fileExists(promptFile)) {
            const content = File.readFile(promptFile)
            promptContents.push(content)
            logger.info(`读取提示文件: ${promptFile}`)
          }
          else {
            logger.warn(`提示文件不存在: ${promptFile}`)
          }
        }
        catch (error) {
          logger.error(`读取提示文件失败: ${promptFile}`, error)
        }
      }

      additionalInstructions = promptContents.join('\n\n')
    }

    process.env.ADDITIONAL_INSTRUCTIONS = additionalInstructions
    logger.info(`设置 ADDITIONAL_INSTRUCTIONS: ${additionalInstructions.length} 字符`)

    logger.success('PR Review 环境变量设置完成')

    process.env.OUTPUT_FILE = resolve(process.cwd(), options.output || 'review.md')

    // 输出环境变量信息（用于调试）
    logger.debug('环境变量摘要:')
    logger.debug(`REVIEW_FILES: ${process.env.REVIEW_FILES}`)
    logger.debug(`REVIEW_FILES_DIFF: ${process.env.REVIEW_FILES_DIFF?.substring(0, 100)}...`)
    logger.debug(`USER_DESCRIPTION: ${process.env.USER_DESCRIPTION}`)
    logger.debug(`ADDITIONAL_INSTRUCTIONS: ${process.env.ADDITIONAL_INSTRUCTIONS}`)

    const prompt = await readFile(new URL('./prompt.txt', import.meta.url))

    // 从 Gemini 获取 review 结果
    const reviewResult = await run(prompt.toString())
    logger.info(`Gemini 返回的 review 结果: ${reviewResult}`)

    // 一般不需要输出， Gemini 的 Prompt 已经要求输出了，再输出会覆盖掉原有的 review 内容
    // // 输出 review 结果
    // return writeFile(new URL(options.output || 'review.md', import.meta.url), reviewResult)
  }
  catch (error) {
    logger.error('PR Review 流程失败', error)
    throw error
  }
}
