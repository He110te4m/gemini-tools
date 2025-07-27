import { existsSync, readFileSync, writeFileSync } from 'node:fs'
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
   * 读取文件内容
   */
  static readFile(filePath: string): string {
    try {
      const absolutePath = resolve(filePath)
      if (!existsSync(absolutePath)) {
        throw new Error(`文件不存在: ${absolutePath}`)
      }
      return readFileSync(absolutePath, 'utf-8')
    }
    catch (error) {
      logger.error(`读取文件失败: ${filePath}`, error)
      throw error
    }
  }

  /**
   * 写入文件内容
   */
  static writeFile(filePath: string, content: string): void {
    try {
      const absolutePath = resolve(filePath)
      writeFileSync(absolutePath, content, 'utf-8')
      logger.info(`文件写入成功: ${absolutePath}`)
    }
    catch (error) {
      logger.error(`写入文件失败: ${filePath}`, error)
      throw error
    }
  }

  /**
   * 检查文件是否存在
   */
  static fileExists(filePath: string): boolean {
    try {
      const absolutePath = resolve(filePath)
      return existsSync(absolutePath)
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
   * 读取多个文件并返回文件信息数组
   */
  static readMultipleFiles(filePaths: string[]): FileInfo[] {
    return filePaths.map((filePath) => {
      const absolutePath = this.getAbsolutePath(filePath)
      const relativePath = this.getRelativePath(filePath)

      try {
        const content = this.readFile(filePath)
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
    }).filter(file => file.content !== undefined)
  }
}
