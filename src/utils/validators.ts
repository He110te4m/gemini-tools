import { z } from 'zod'

// Gemini 配置验证模式
export const GeminiConfigSchema = z.object({
  apiKey: z.string().min(1, 'API Key 不能为空'),
  model: z.string().min(1, '模型名称不能为空'),
})

// 环境变量验证模式
export const EnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY 环境变量必须设置'),
  GEMINI_MODEL: z.enum(['gemini-pro', 'gemini-pro-vision']).default('gemini-pro'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

// 导出类型
export type GeminiConfig = z.infer<typeof GeminiConfigSchema>
export type EnvConfig = z.infer<typeof EnvSchema>

// 便捷验证函数
export class Validators {
  /**
   * 验证 API Key
   */
  static validateApiKey(apiKey: string): { success: boolean, error?: string } {
    const result = z.string().min(1).safeParse(apiKey)
    return result.success
      ? { success: true }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证模型名称
   */
  static validateModel(model: string): { success: boolean, error?: string } {
    const result = z.enum(['gemini-pro', 'gemini-pro-vision']).safeParse(model)
    return result.success
      ? { success: true }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证温度参数
   */
  static validateTemperature(temperature: number): { success: boolean, error?: string } {
    const result = z.number().min(0).max(2).safeParse(temperature)
    return result.success
      ? { success: true }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证最大 token 数
   */
  static validateMaxTokens(maxTokens: number): { success: boolean, error?: string } {
    const result = z.number().int().positive().max(8192).safeParse(maxTokens)
    return result.success
      ? { success: true }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证输入文本
   */
  static validateInputText(text: string): { success: boolean, error?: string } {
    const result = z.string().min(1).safeParse(text.trim())
    return result.success
      ? { success: true }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证 Gemini 配置
   */
  static validateGeminiConfig(config: unknown): { success: boolean, data?: GeminiConfig, error?: string } {
    const result = GeminiConfigSchema.safeParse(config)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证环境变量
   */
  static validateEnv(env: unknown): { success: boolean, data?: EnvConfig, error?: string } {
    const result = EnvSchema.safeParse(env)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues[0]?.message }
  }
}
