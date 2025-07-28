import type { UnitTestOptions } from '../../utils/validators'
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
interface UnitTestEnvironment {
  inputFiles: string
  additionalInstructions: string
  outputFile: string
}

/**
 * 验证输入文件
 */
async function validateInputFile(inputPath: string): Promise<void> {
  const pathType = await File.getPathType(inputPath)
  if (pathType === 'nonexistent') {
    throw new Error(`输入路径不存在: ${inputPath}`)
  }
}

/**
 * 获取所有需要处理的文件路径
 */
async function getInputFiles(inputPath: string, ignorePatterns?: string[]): Promise<string[]> {
  const pathType = await File.getPathType(inputPath)

  if (pathType === 'file') {
    // 单个文件
    const relativePath = File.getRelativePath(inputPath)
    if (File.isFileIgnored(relativePath, ignorePatterns)) {
      logger.warn(`文件被忽略: ${relativePath}`)
      return []
    }
    return [inputPath]
  }
  else if (pathType === 'directory') {
    // 目录，递归获取所有文件
    const files = await File.readDirectoryFiles(inputPath, ignorePatterns)
    logger.info(`从目录 ${inputPath} 中找到 ${files.length} 个文件`)
    return files
  }

  return []
}

/**
 * 设置环境变量
 */
function setupEnvironmentVariables(env: UnitTestEnvironment): void {
  process.env.INPUT_FILES = env.inputFiles
  process.env.ADDITIONAL_INSTRUCTIONS = env.additionalInstructions
  process.env.OUTPUT_FILE = env.outputFile
}

/**
 * 记录环境变量摘要（调试用）
 */
function logEnvironmentSummary(env: UnitTestEnvironment): void {
  logger.debug('环境变量摘要:')
  logger.debug(`INPUT_FILES: ${env.inputFiles}`)
  logger.debug(`ADDITIONAL_INSTRUCTIONS: ${env.additionalInstructions}`)
  logger.debug(`OUTPUT_FILE: ${env.outputFile}`)
}

/**
 * 执行 Gemini 单元测试生成
 */
async function executeGeminiUnitTest(): Promise<string> {
  const promptFile = resolve(__dirname, 'prompt.txt')
  logger.debug(`Gemini 执行的 prompt 文件: ${promptFile}`)

  const testResult = await run(promptFile)
  if (!await File.fileExists(process.env.OUTPUT_FILE!)) {
    await File.writeFile(process.env.OUTPUT_FILE!, testResult)
  }
  logger.info(`Gemini 返回的测试结果: ${testResult}`)

  return testResult
}

/**
 * 主函数：执行单元测试生成
 */
export async function unitTest(options: UnitTestOptions): Promise<void> {
  logger.info('开始单元测试生成流程')

  // 验证输入路径
  await validateInputFile(options.input)

  // 获取所有需要处理的文件
  const inputFiles = await getInputFiles(options.input, options.ignores)

  if (inputFiles.length === 0) {
    throw new Error('没有找到需要处理的文件，请检查输入路径和忽略规则')
  }

  // 将文件路径列表转换为字符串
  const inputFilesString = inputFiles.join(',')
  logger.info(`找到 ${inputFiles.length} 个文件: ${inputFilesString}`)

  // 处理额外提示（异步操作）
  const additionalInstructions = await processAdditionalPrompts(options.additionalPrompts)
  logger.info(`设置 ADDITIONAL_INSTRUCTIONS: ${additionalInstructions.length} 字符`)

  // 设置输出文件路径
  const outputFile = resolve(process.cwd(), options.output)
  // 删除已有的文件，确保建议是最新的
  await File.removeFile(outputFile)

  // 构建环境变量对象
  const env: UnitTestEnvironment = {
    inputFiles: inputFilesString,
    additionalInstructions,
    outputFile,
  }

  // 设置环境变量
  setupEnvironmentVariables(env)
  logger.success('单元测试生成环境变量设置完成')

  // 记录环境变量摘要
  logEnvironmentSummary(env)

  // 执行 Gemini 单元测试生成
  await executeGeminiUnitTest()

  logger.success(`单元测试生成完成，结果已输出到: ${outputFile}`)
}
