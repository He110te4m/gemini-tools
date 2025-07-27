import type { EnvConfig, GeminiConfig } from '../utils/validators.js'
import { dirname } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import { Validators } from '../utils/validators.js'

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 加载环境变量
config()

export class ConfigManager {
  private static instance: ConfigManager
  private config: GeminiConfig
  private envConfig: EnvConfig

  private constructor() {
    // 验证环境变量
    const envValidation = Validators.validateEnv(process.env)
    if (!envValidation.success) {
      throw new Error(`环境变量验证失败: ${envValidation.error}`)
    }

    this.envConfig = envValidation.data!

    // 构建 Gemini 配置
    this.config = {
      apiKey: this.envConfig.GEMINI_API_KEY,
      model: this.envConfig.GEMINI_MODEL,
      temperature: this.envConfig.GEMINI_TEMPERATURE,
      maxTokens: this.envConfig.GEMINI_MAX_TOKENS,
    }
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  public getConfig(): GeminiConfig {
    return { ...this.config }
  }

  public getEnvConfig(): EnvConfig {
    return { ...this.envConfig }
  }

  public updateConfig(updates: Partial<GeminiConfig>): void {
    // 验证更新后的配置
    const newConfig = { ...this.config, ...updates }
    const validation = Validators.validateGeminiConfig(newConfig)

    if (!validation.success) {
      throw new Error(`配置验证失败: ${validation.error}`)
    }

    this.config = validation.data!
  }

  public validateConfig(): boolean {
    const validation = Validators.validateGeminiConfig(this.config)
    return validation.success
  }

  public getValidationErrors(): string[] {
    const validation = Validators.validateGeminiConfig(this.config)
    if (validation.success) {
      return []
    }

    // 这里可以返回更详细的错误信息
    return [validation.error || '未知配置错误']
  }
}

export function getConfig(): GeminiConfig {
  return ConfigManager.getInstance().getConfig()
}

export function getEnvConfig(): EnvConfig {
  return ConfigManager.getInstance().getEnvConfig()
}
