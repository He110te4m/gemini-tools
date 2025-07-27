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

// PR Review 命令选项验证模式
export const PrReviewOptionsSchema = z.object({
  additionalPrompts: z.array(z.string()).optional(),
  sourceBranch: z.string().min(1, '源分支名称不能为空'),
  targetBranch: z.string().min(1, '目标分支名称不能为空'),
  output: z.string().optional(),
  model: z.string().optional(),
})

// Module Review 命令选项验证模式
export const ModuleReviewOptionsSchema = z.object({
  additionalPrompts: z.array(z.string()).optional(),
  ignores: z.array(z.string()).optional(),
  inputs: z.array(z.string()).min(1, '至少需要指定一个输入文件'),
  output: z.string().optional(),
  model: z.string().optional(),
})

// 导出类型
export type GeminiConfig = z.infer<typeof GeminiConfigSchema>
export type EnvConfig = z.infer<typeof EnvSchema>
export type PrReviewOptions = z.infer<typeof PrReviewOptionsSchema>
export type ModuleReviewOptions = z.infer<typeof ModuleReviewOptionsSchema>

type ValidatorResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
}

// 便捷验证函数
export class Validators {
  /**
   * 验证 API Key
   */
  static validateApiKey(apiKey: string): ValidatorResult<string> {
    const result = z.string().min(1).safeParse(apiKey)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证模型名称
   */
  static validateModel(model: string): ValidatorResult<string> {
    const result = z.enum(['gemini-pro', 'gemini-pro-vision']).safeParse(model)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证温度参数
   */
  static validateTemperature(temperature: number): ValidatorResult<number> {
    const result = z.number().min(0).max(2).safeParse(temperature)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证最大 token 数
   */
  static validateMaxTokens(maxTokens: number): ValidatorResult<number> {
    const result = z.number().int().positive().max(8192).safeParse(maxTokens)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证输入文本
   */
  static validateInputText(text: string): ValidatorResult<string> {
    const result = z.string().min(1).safeParse(text.trim())
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证 Gemini 配置
   */
  static validateGeminiConfig(config: unknown): ValidatorResult<GeminiConfig> {
    const result = GeminiConfigSchema.safeParse(config)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证环境变量
   */
  static validateEnv(env: unknown): ValidatorResult<EnvConfig> {
    const result = EnvSchema.safeParse(env)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证 PR Review 选项
   */
  static validatePrReviewOptions(options: unknown): ValidatorResult<PrReviewOptions> {
    const result = PrReviewOptionsSchema.safeParse(options)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证 Module Review 选项
   */
  static validateModuleReviewOptions(options: unknown): ValidatorResult<ModuleReviewOptions> {
    const result = ModuleReviewOptionsSchema.safeParse(options)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues[0]?.message }
  }
}
