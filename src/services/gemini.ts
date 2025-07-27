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

export class Gemini {
  private static instance: Gemini | null = null
  private isAvailable: boolean = false
  private config: GeminiConfig

  private constructor() {
    this.checkAvailability()
    this.config = getConfig()
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): Gemini {
    if (!Gemini.instance) {
      Gemini.instance = new Gemini()
    }
    return Gemini.instance
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

    // 使用 zx 的 pipe 功能，通过 stdin 传递 prompt
    return ShellExecutor.getOutput($ =>
      $`echo ${prompt} | gemini --yolo -m ${this.config.model}`,
    )
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
  const service = Gemini.getInstance()
  return service.run(prompt)
}
