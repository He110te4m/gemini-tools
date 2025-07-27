import type { ChatResponse } from '../utils/validators.js'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import process from 'node:process'
import { logger } from '../utils/logger.js'

export interface CodeGenerationResponse {
  content: string
  language?: string
}

export interface CodeAnalysisResponse {
  content: string
  analysisType: string
}

export class GeminiService {
  private config: any

  constructor() {
    // 从环境变量获取配置
    this.config = {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      temperature: process.env.GEMINI_TEMPERATURE || '0.7',
      maxTokens: process.env.GEMINI_MAX_TOKENS || '2048',
    }
  }

  /**
   * 调用 gemini-cli 进行聊天
   */
  async chat(message: string): Promise<ChatResponse> {
    try {
      const command = `gemini-cli chat "${this.escapeMessage(message)}" --model ${this.config.model} --temperature ${this.config.temperature}`
      const result = execSync(command, {
        encoding: 'utf8',
        env: { ...process.env, GEMINI_API_KEY: this.config.apiKey },
      })

      return {
        content: result.trim(),
        usage: {
          promptTokens: 0,
          responseTokens: 0,
          totalTokens: 0,
        },
      }
    }
    catch (error) {
      logger.error('Gemini 聊天调用失败:', error)
      throw new Error(`聊天失败: ${error}`)
    }
  }

  /**
   * 调用 gemini-cli 进行代码生成
   */
  async generateCode(prompt: string, language?: string): Promise<CodeGenerationResponse> {
    try {
      let command = `gemini-cli code "${this.escapeMessage(prompt)}" --model ${this.config.model} --temperature ${this.config.temperature}`

      if (language) {
        command += ` --language ${language}`
      }

      const result = execSync(command, {
        encoding: 'utf8',
        env: { ...process.env, GEMINI_API_KEY: this.config.apiKey },
      })

      return {
        content: result.trim(),
        language: language || 'unknown',
      }
    }
    catch (error) {
      logger.error('Gemini 代码生成失败:', error)
      throw new Error(`代码生成失败: ${error}`)
    }
  }

  /**
   * 调用 gemini-cli 进行代码分析
   */
  async analyzeCode(code: string, language?: string, analysisType: string = 'comprehensive'): Promise<CodeAnalysisResponse> {
    try {
      // 将代码写入临时文件
      const tempFile = `/tmp/gemini_analysis_${Date.now()}.txt`
      fs.writeFileSync(tempFile, code)

      let command = `gemini-cli analyze "${tempFile}" --type ${analysisType} --model ${this.config.model}`

      if (language) {
        command += ` --language ${language}`
      }

      const result = execSync(command, {
        encoding: 'utf8',
        env: { ...process.env, GEMINI_API_KEY: this.config.apiKey },
      })

      // 清理临时文件
      try {
        fs.unlinkSync(tempFile)
      }
      catch {
        // 忽略清理错误
      }

      return {
        content: result.trim(),
        analysisType,
      }
    }
    catch (error) {
      logger.error('Gemini 代码分析失败:', error)
      throw new Error(`代码分析失败: ${error}`)
    }
  }

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
      execSync('gemini-cli --version', { stdio: 'ignore' })
      return true
    }
    catch {
      return false
    }
  }
}
