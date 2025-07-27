import { z } from 'zod'

// Gemini 配置验证模式
export const GeminiConfigSchema = z.object({
  apiKey: z.string().min(1, 'API Key 不能为空'),
  model: z.enum(['gemini-pro', 'gemini-pro-vision']),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().positive().max(8192).default(2048),
})

// 聊天消息验证模式
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, '消息内容不能为空'),
})

// 聊天响应验证模式
export const ChatResponseSchema = z.object({
  content: z.string(),
  usage: z.object({
    promptTokens: z.number().int().nonnegative(),
    responseTokens: z.number().int().nonnegative(),
    totalTokens: z.number().int().nonnegative(),
  }).optional(),
})

// Shell 命令验证模式
export const ShellCommandSchema = z.object({
  command: z.string().min(1, '命令不能为空'),
  cwd: z.string().optional(),
  silent: z.boolean().optional(),
  timeout: z.number().positive().optional(),
})

// 文件路径验证模式
export const FilePathSchema = z.string().min(1, '文件路径不能为空')

// 代码生成参数验证模式
export const CodeGenerationSchema = z.object({
  prompt: z.string().min(1, '代码生成提示不能为空'),
  language: z.string().optional(),
  outputFile: z.string().optional(),
})

// 代码分析参数验证模式
export const CodeAnalysisSchema = z.object({
  code: z.string().min(1, '代码内容不能为空'),
  language: z.string().optional(),
  type: z.enum(['complexity', 'security', 'performance', 'style', 'comprehensive']).default('complexity'),
})

// 环境变量验证模式
export const EnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY 环境变量必须设置'),
  GEMINI_MODEL: z.enum(['gemini-pro', 'gemini-pro-vision']).default('gemini-pro'),
  GEMINI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
  GEMINI_MAX_TOKENS: z.coerce.number().int().positive().max(8192).default(2048),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

// 导出类型
export type GeminiConfig = z.infer<typeof GeminiConfigSchema>
export type ChatMessage = z.infer<typeof ChatMessageSchema>
export type ChatResponse = z.infer<typeof ChatResponseSchema>
export type ShellCommand = z.infer<typeof ShellCommandSchema>
export type CodeGeneration = z.infer<typeof CodeGenerationSchema>
export type CodeAnalysis = z.infer<typeof CodeAnalysisSchema>
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
   * 验证文件路径
   */
  static validateFilePath(filePath: string): { success: boolean, error?: string } {
    const result = FilePathSchema.safeParse(filePath)
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

  /**
   * 验证聊天消息
   */
  static validateChatMessage(message: unknown): { success: boolean, data?: ChatMessage, error?: string } {
    const result = ChatMessageSchema.safeParse(message)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证 Shell 命令
   */
  static validateShellCommand(command: unknown): { success: boolean, data?: ShellCommand, error?: string } {
    const result = ShellCommandSchema.safeParse(command)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证代码生成参数
   */
  static validateCodeGeneration(params: unknown): { success: boolean, data?: CodeGeneration, error?: string } {
    const result = CodeGenerationSchema.safeParse(params)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues[0]?.message }
  }

  /**
   * 验证代码分析参数
   */
  static validateCodeAnalysis(params: unknown): { success: boolean, data?: CodeAnalysis, error?: string } {
    const result = CodeAnalysisSchema.safeParse(params)
    return result.success
      ? { success: true, data: result.data }
      : { success: false, error: result.error.issues[0]?.message }
  }
}
