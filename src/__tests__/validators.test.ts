import { describe, expect, it } from 'vitest'
import { GeminiConfigSchema, Validators } from '../utils/validators'

describe('zod Validators', () => {
  describe('aPI Key Validation', () => {
    it('should validate valid API key', () => {
      const result = Validators.validateApiKey('valid-api-key')
      expect(result.success).toBe(true)
    })

    it('should reject empty API key', () => {
      const result = Validators.validateApiKey('')
      expect(result.success).toBe(false)
      // 主要是规避 ts 类型报错，必须收窄为 false 才能访问到 error
      if (result.success === false) {
        expect(result.error).toBe('Too small: expected string to have >=1 characters')
      }
    })
  })

  describe('model Validation', () => {
    it('should validate gemini-pro model', () => {
      const result = Validators.validateModel('gemini-pro')
      expect(result.success).toBe(true)
    })

    it('should validate gemini-pro-vision model', () => {
      const result = Validators.validateModel('gemini-pro-vision')
      expect(result.success).toBe(true)
    })

    it('should reject invalid model', () => {
      const result = Validators.validateModel('invalid-model')
      expect(result.success).toBe(false)
    })
  })

  describe('temperature Validation', () => {
    it('should validate valid temperature', () => {
      const result = Validators.validateTemperature(0.7)
      expect(result.success).toBe(true)
    })

    it('should reject negative temperature', () => {
      const result = Validators.validateTemperature(-0.1)
      expect(result.success).toBe(false)
    })

    it('should reject temperature above 2', () => {
      const result = Validators.validateTemperature(2.1)
      expect(result.success).toBe(false)
    })
  })

  describe('input Text Validation', () => {
    it('should validate non-empty text', () => {
      const result = Validators.validateInputText('Hello, world!')
      expect(result.success).toBe(true)
    })

    it('should reject empty text', () => {
      const result = Validators.validateInputText('')
      expect(result.success).toBe(false)
    })

    it('should reject whitespace-only text', () => {
      const result = Validators.validateInputText('   ')
      expect(result.success).toBe(false)
    })
  })

  describe('gemini Config Validation', () => {
    it('should validate complete config', () => {
      const config = {
        apiKey: 'test-api-key',
        model: 'gemini-pro',
      }

      const result = Validators.validateGeminiConfig(config)
      expect(result.success).toBe(true)
      // 主要是规避 ts 类型报错，必须收窄为 true 才能访问到 data
      if (result.success === true) {
        expect(result.data).toEqual(config)
      }
    })

    it('should reject config with missing API key', () => {
      const config = {
        apiKey: '',
        model: 'gemini-pro',
      }

      const result = Validators.validateGeminiConfig(config)
      expect(result.success).toBe(false)
    })

    it('should reject config with missing model', () => {
      const config = {
        apiKey: 'test-api-key',
        model: '',
      }

      const result = Validators.validateGeminiConfig(config)
      expect(result.success).toBe(false)
    })
  })

  describe('schema Direct Usage', () => {
    it('should parse valid Gemini config', () => {
      const config = {
        apiKey: 'test-key',
        model: 'gemini-pro',
      }

      const result = GeminiConfigSchema.safeParse(config)
      expect(result.success).toBe(true)
    })

    it('should reject invalid Gemini config', () => {
      const config = {
        apiKey: '',
        model: 'gemini-pro',
      }

      const result = GeminiConfigSchema.safeParse(config)
      expect(result.success).toBe(false)
    })
  })
})
