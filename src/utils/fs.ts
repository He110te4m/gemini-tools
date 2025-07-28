import { access, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { logger } from './logger.js'

export interface FileInfo {
  absolutePath: string
  relativePath: string
  content?: string
  diff?: string
}

export class File {
  /**
   * 异步读取文件内容
   */
  static async readFile(filePath: string): Promise<string> {
    try {
      const absolutePath = resolve(filePath)
      const content = await readFile(absolutePath, 'utf-8')
      return content
    }
    catch (error) {
      logger.error(`读取文件失败: ${filePath}`, error)
      throw error
    }
  }

  /**
   * 异步写入文件内容
   */
  static async writeFile(filePath: string, content: string): Promise<void> {
    try {
      const absolutePath = resolve(filePath)
      await writeFile(absolutePath, content, 'utf-8')
      logger.info(`文件写入成功: ${absolutePath}`)
    }
    catch (error) {
      logger.error(`写入文件失败: ${filePath}`, error)
      throw error
    }
  }

  /**
   * 异步检查文件是否存在
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      const absolutePath = resolve(filePath)
      await access(absolutePath)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 获取文件的绝对路径
   */
  static getAbsolutePath(filePath: string): string {
    return resolve(filePath)
  }

  /**
   * 获取相对于当前工作目录的路径
   */
  static getRelativePath(filePath: string): string {
    const absolutePath = resolve(filePath)
    const cwd = process.cwd()
    return absolutePath.replace(cwd, '').replace(/^\/+/, '')
  }

  /**
   * 异步读取多个文件并返回文件信息数组
   */
  static async readMultipleFiles(filePaths: string[]): Promise<FileInfo[]> {
    const filePromises = filePaths.map(async (filePath) => {
      const absolutePath = this.getAbsolutePath(filePath)
      const relativePath = this.getRelativePath(filePath)

      try {
        const content = await this.readFile(filePath)
        return {
          absolutePath,
          relativePath,
          content,
        }
      }
      catch (error) {
        logger.warn(`跳过文件 ${filePath}: ${error}`)
        return {
          absolutePath,
          relativePath,
        }
      }
    })

    const results = await Promise.all(filePromises)
    return results.filter(file => file.content !== undefined)
  }
}
