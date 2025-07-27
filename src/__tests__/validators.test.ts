import { describe, expect, it } from 'vitest'
import { ChatMessageSchema, GeminiConfigSchema, Validators } from '../utils/validators.js'

describe('zod Validators', () => {
  describe('aPI Key Validation', () => {
    it('should validate valid API key', () => {
      const result = Validators.validateApiKey('valid-api-key')
      expect(result.success).toBe(true)
    })

    it('should reject empty API key', () => {
      const result = Validators.validateApiKey('')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Too small: expected string to have >=1 characters')
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
        temperature: 0.7,
        maxTokens: 2048,
      }

      const result = Validators.validateGeminiConfig(config)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(config)
    })

    it('should reject config with missing API key', () => {
      const config = {
        apiKey: '',
        model: 'gemini-pro',
        temperature: 0.7,
        maxTokens: 2048,
      }

      const result = Validators.validateGeminiConfig(config)
      expect(result.success).toBe(false)
    })
  })

  describe('chat Message Validation', () => {
    it('should validate user message', () => {
      const message = {
        role: 'user' as const,
        content: 'Hello, AI!',
      }

      const result = Validators.validateChatMessage(message)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(message)
    })

    it('should validate assistant message', () => {
      const message = {
        role: 'assistant' as const,
        content: 'Hello, human!',
      }

      const result = Validators.validateChatMessage(message)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(message)
    })

    it('should reject message with invalid role', () => {
      const message = {
        role: 'invalid' as any,
        content: 'Hello!',
      }

      const result = Validators.validateChatMessage(message)
      expect(result.success).toBe(false)
    })
  })

  describe('schema Direct Usage', () => {
    it('should parse valid Gemini config', () => {
      const config = {
        apiKey: 'test-key',
        model: 'gemini-pro',
        temperature: 0.5,
        maxTokens: 1024,
      }

      const result = GeminiConfigSchema.safeParse(config)
      expect(result.success).toBe(true)
    })

    it('should parse valid chat message', () => {
      const message = {
        role: 'user' as const,
        content: 'Test message',
      }

      const result = ChatMessageSchema.safeParse(message)
      expect(result.success).toBe(true)
    })
  })
})
