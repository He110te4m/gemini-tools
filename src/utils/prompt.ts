import { File } from './fs'
import { logger } from './logger'

/**
 * 读取并处理额外的提示文件
 */
export async function processAdditionalPrompts(additionalPrompts?: string[]): Promise<string> {
  if (!additionalPrompts || additionalPrompts.length === 0) {
    return ''
  }

  const promptContents: string[] = []

  for (const promptFile of additionalPrompts) {
    try {
      const exists = await File.fileExists(promptFile)
      if (exists) {
        const content = await File.readFile(promptFile)
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

  return promptContents.join('\n\n')
}
