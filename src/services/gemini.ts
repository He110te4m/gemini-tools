import { execSync } from 'node:child_process'

export interface CodeGenerationResponse {
  content: string
  language?: string
}

export interface CodeAnalysisResponse {
  content: string
  analysisType: string
}

export class GeminiService {
  /**
   * 转义消息内容，防止命令行注入
   */
  private escapeMessage(message: string): string {
    return message
      .replace(/"/g, '\\"')
      .replace(/\$/g, '\\$')
      .replace(/`/g, '\\`')
      .replace(/\\/g, '\\\\')
  }

  /**
   * 检查 gemini-cli 是否可用
   */
  static async checkAvailability(): Promise<boolean> {
    try {
      execSync('gemini --version', { stdio: 'ignore' })
      return true
    }
    catch {
      return false
    }
  }
}
