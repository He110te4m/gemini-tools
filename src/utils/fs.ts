import { access, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { minimatch } from 'minimatch'
import { logger } from './logger'

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

  /**
   * 检查文件是否被忽略
   */
  static isFileIgnored(filePath: string, ignorePatterns?: string[]): boolean {
    if (!ignorePatterns || ignorePatterns.length === 0) {
      return false
    }

    for (const pattern of ignorePatterns) {
      try {
        if (minimatch(filePath, pattern)) {
          logger.debug(`文件 ${filePath} 匹配忽略模式 ${pattern}`)
          return true
        }
      }
      catch (error) {
        logger.warn(`无效的忽略模式: ${pattern}`, error)
      }
    }

    return false
  }

  /**
   * 递归读取目录中的所有文件
   */
  static async readDirectoryFiles(dirPath: string, ignorePatterns?: string[]): Promise<string[]> {
    const files: string[] = []
    const absoluteDirPath = resolve(dirPath)

    try {
      const items = await readdir(absoluteDirPath)

      for (const item of items) {
        const itemPath = join(absoluteDirPath, item)
        const relativePath = this.getRelativePath(itemPath)
        const stats = await stat(itemPath)

        if (stats.isDirectory()) {
          // 递归处理子目录
          const subFiles = await this.readDirectoryFiles(itemPath, ignorePatterns)
          files.push(...subFiles)
        }
        else if (stats.isFile()) {
          // 检查文件是否被忽略
          if (!this.isFileIgnored(relativePath, ignorePatterns)) {
            files.push(itemPath)
          }
          else {
            logger.debug(`忽略文件: ${relativePath}`)
          }
        }
      }
    }
    catch (error) {
      logger.error(`读取目录失败: ${dirPath}`, error)
      throw error
    }

    return files
  }

  /**
   * 检查路径是文件还是目录
   */
  static async getPathType(path: string): Promise<'file' | 'directory' | 'nonexistent'> {
    try {
      const stats = await stat(resolve(path))
      return stats.isDirectory() ? 'directory' : 'file'
    }
    catch {
      return 'nonexistent'
    }
  }

  /**
   * 删除文件
   */
  static async removeFile(filePath: string): Promise<void> {
    await unlink(resolve(filePath))
  }
}
