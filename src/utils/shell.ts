import { $ } from 'zx'
import { logger } from './logger.js'

export interface ShellOptions {
  cwd?: string
  silent?: boolean
  timeout?: number
}

export interface ShellResult {
  stdout: string
  stderr: string
  exitCode: number
  success: boolean
}

export class ShellExecutor {
  /**
   * 执行 shell 命令
   */
  static async execute(command: string, _options: ShellOptions = {}): Promise<ShellResult> {
    try {
      logger.info(`执行命令: ${command}`)

      const result = await $`${command}`

      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode ?? -1,
        success: (result.exitCode ?? -1) === 0,
      }
    }
    catch (error) {
      logger.error(`命令执行失败: ${command}`, error)

      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: -1,
        success: false,
      }
    }
  }

  /**
   * 执行命令并返回输出
   */
  static async getOutput(command: string, options: ShellOptions = {}): Promise<string> {
    const result = await this.execute(command, options)
    if (!result.success) {
      throw new Error(`命令执行失败: ${result.stderr}`)
    }
    return result.stdout.trim()
  }

  /**
   * 检查命令是否存在
   */
  static async commandExists(command: string): Promise<boolean> {
    try {
      await $`which ${command}`
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 执行多个命令
   */
  static async executeMultiple(commands: string[], options: ShellOptions = {}): Promise<ShellResult[]> {
    const results: ShellResult[] = []

    for (const command of commands) {
      const result = await this.execute(command, options)
      results.push(result)

      if (!result.success) {
        logger.warn(`命令执行失败，停止后续命令: ${command}`)
        break
      }
    }

    return results
  }

  /**
   * 在指定目录执行命令
   */
  static async executeInDir(command: string, dir: string, options: ShellOptions = {}): Promise<ShellResult> {
    return this.execute(command, { ...options, cwd: dir })
  }

  /**
   * 执行 git 命令
   */
  static async git(command: string, options: ShellOptions = {}): Promise<ShellResult> {
    return this.execute(`git ${command}`, options)
  }

  /**
   * 执行 npm 命令
   */
  static async npm(command: string, options: ShellOptions = {}): Promise<ShellResult> {
    return this.execute(`npm ${command}`, options)
  }

  /**
   * 执行 yarn 命令
   */
  static async yarn(command: string, options: ShellOptions = {}): Promise<ShellResult> {
    return this.execute(`yarn ${command}`, options)
  }

  /**
   * 执行 pnpm 命令
   */
  static async pnpm(command: string, options: ShellOptions = {}): Promise<ShellResult> {
    return this.execute(`pnpm ${command}`, options)
  }
}

// 导出便捷函数
export const shell = {
  execute: ShellExecutor.execute,
  getOutput: ShellExecutor.getOutput,
  commandExists: ShellExecutor.commandExists,
  executeMultiple: ShellExecutor.executeMultiple,
  executeInDir: ShellExecutor.executeInDir,
  git: ShellExecutor.git,
  npm: ShellExecutor.npm,
  yarn: ShellExecutor.yarn,
  pnpm: ShellExecutor.pnpm,
}
