import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reviewPr } from '../core/review/pr.js'
import { File } from '../utils/fs.js'
import { Git } from '../utils/git.js'

// Mock 依赖
vi.mock('../utils/git.js')
vi.mock('../utils/fs.js')
vi.mock('../utils/logger.js')
vi.mock('../services/gemini.js')

describe('reviewPr', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 清理环境变量
    delete process.env.REVIEW_FILES
    delete process.env.REVIEW_FILES_DIFF
    delete process.env.USER_DESCRIPTION
    delete process.env.ADDITIONAL_INSTRUCTIONS
  })

  it('应该正确设置环境变量', async () => {
    // Mock Git 工具
    const mockGit = vi.mocked(Git)
    mockGit.isGitRepository.mockResolvedValue(true)
    mockGit.branchExists.mockResolvedValue(true)
    mockGit.getChangedFiles.mockResolvedValue(['src/file1.ts', 'src/file2.ts'])
    mockGit.getAllFileDiffs.mockResolvedValue({
      'src/file1.ts': {
        absolutePath: '/absolute/path/src/file1.ts',
        diff: '@@ -1,3 +1,3 @@\n-old line\n+new line',
      },
    })
    mockGit.getCommitsBetweenBranches.mockResolvedValue([
      {
        hash: 'abc123',
        author: 'Test User',
        date: '2024-01-01T00:00:00Z',
        message: 'feat: add new feature',
      },
    ])

    // Mock 文件系统工具
    const mockFile = vi.mocked(File)
    mockFile.fileExists.mockResolvedValue(false)

    // Mock Gemini 服务
    const { run } = await import('../services/gemini.js')
    vi.mocked(run).mockResolvedValue('Review completed')

    const options = {
      sourceBranch: 'feature',
      targetBranch: 'main',
      additionalPrompts: [],
    }

    await reviewPr(options)

    // 验证环境变量是否被正确设置
    expect(process.env.REVIEW_FILES).toBe('src/file1.ts,src/file2.ts')
    expect(process.env.REVIEW_FILES_DIFF).toBeDefined()
    expect(process.env.USER_DESCRIPTION).toContain('feat: add new feature')
    expect(process.env.ADDITIONAL_INSTRUCTIONS).toBe('')
  })

  it('应该处理 additionalPrompts 文件', async () => {
    // Mock Git 工具
    const mockGit = vi.mocked(Git)
    mockGit.isGitRepository.mockResolvedValue(true)
    mockGit.branchExists.mockResolvedValue(true)
    mockGit.getChangedFiles.mockResolvedValue([])
    mockGit.getAllFileDiffs.mockResolvedValue({})
    mockGit.getCommitsBetweenBranches.mockResolvedValue([])

    // Mock 文件系统工具
    const mockFile = vi.mocked(File)
    mockFile.fileExists.mockResolvedValue(true)
    mockFile.readFile.mockResolvedValue('focus on security')

    // Mock Gemini 服务
    const { run } = await import('../services/gemini.js')
    vi.mocked(run).mockResolvedValue('Review completed')

    const options = {
      sourceBranch: 'feature',
      targetBranch: 'main',
      additionalPrompts: ['prompt1.txt', 'prompt2.txt'],
    }

    await reviewPr(options)

    expect(process.env.ADDITIONAL_INSTRUCTIONS).toBe('focus on security\n\nfocus on security')
  })

  it('应该在非 Git 仓库中抛出错误', async () => {
    const mockGit = vi.mocked(Git)
    mockGit.isGitRepository.mockResolvedValue(false)

    const options = {
      sourceBranch: 'feature',
      targetBranch: 'main',
      additionalPrompts: [],
    }

    await expect(reviewPr(options)).rejects.toThrow('当前目录不是 Git 仓库')
  })

  it('应该在分支不存在时抛出错误', async () => {
    const mockGit = vi.mocked(Git)
    mockGit.isGitRepository.mockResolvedValue(true)
    mockGit.branchExists.mockResolvedValue(false)

    const options = {
      sourceBranch: 'feature',
      targetBranch: 'main',
      additionalPrompts: [],
    }

    await expect(reviewPr(options)).rejects.toThrow('源分支不存在: feature')
  })
})
