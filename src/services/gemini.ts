import type { GeminiConfig } from '../utils/validators'
import { execSync } from 'node:child_process'
import { ShellExecutor } from '../utils/shell'
import { getConfig } from './config'

export interface CodeGenerationResponse {
  content: string
  language?: string
}

export interface CodeAnalysisResponse {
  content: string
  analysisType: string
}

export class GeminiService {
  private static instance: GeminiService | null = null
  private isAvailable: boolean = false
  private config: GeminiConfig

  private constructor() {
    this.checkAvailability()
    this.config = getConfig()
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService()
    }
    return GeminiService.instance
  }

  /**
   * 转义消息内容，防止命令行注入
   * 虽然 zx 会处理模板字符串，但我们仍需要确保传递给它的字符串是安全的
   */
  private escapeMessage(message: string): string {
    return message
      // 转义双引号：防止字符串提前结束
      // 场景：用户输入包含 " 的提示词，如：'请分析这个"重要"的代码'
      // 不转义会导致：gemini -p "请分析这个"重要"的代码" -m model
      // 转义后变成：gemini -p "请分析这个\"重要\"的代码" -m model
      .replace(/"/g, '\\"')

      // 转义美元符号：防止 shell 变量替换
      // 场景：用户输入包含 $ 的提示词，如：'请检查 $PATH 变量的设置'
      // 不转义会导致：shell 尝试替换 $PATH 为实际路径
      // 转义后变成：gemini -p "请检查 \$PATH 变量的设置" -m model
      .replace(/\$/g, '\\$')

      // 转义反引号：防止命令替换
      // 场景：用户输入包含 ` 的提示词，如：'请执行 `ls -la` 命令'
      // 不转义会导致：shell 尝试执行 ls -la 命令并替换结果
      // 转义后变成：gemini -p "请执行 \`ls -la\` 命令" -m model
      .replace(/`/g, '\\`')

      // 转义反斜杠：防止转义字符被误解
      // 场景：用户输入包含 \ 的提示词，如：'请处理 C:\Users\path 路径'
      // 不转义会导致：后续字符被误解为转义字符
      // 转义后变成：gemini -p "请处理 C:\\Users\\path 路径" -m model
      .replace(/\\/g, '\\\\')
  }

  /**
   * 检查 gemini-cli 是否可用
   */
  private checkAvailability(): void {
    try {
      execSync('gemini --version', { stdio: 'ignore' })
      this.isAvailable = true
    }
    catch {
      this.isAvailable = false
      throw new Error('Gemini CLI 不可用，请确保已正确安装 gemini-cli')
    }
  }

  /**
   * 运行 Gemini 命令
   */
  public async run(prompt: string): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('Gemini CLI 不可用')
    }

    const escapedPrompt = this.escapeMessage(prompt)
    return ShellExecutor.getOutput(`gemini -p "${escapedPrompt}" -m ${this.config.model}`)
  }

  /**
   * 检查服务是否可用
   */
  public isServiceAvailable(): boolean {
    return this.isAvailable
  }
}

/**
 * 直接暴露的 run 函数，方便外部调用
 */
export async function run(prompt: string): Promise<string> {
  const service = GeminiService.getInstance()
  return service.run(prompt)
}
