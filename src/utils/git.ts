import { logger } from './logger'
import { ShellExecutor } from './shell'

export interface GitDiffInfo {
  absolutePath: string
  diff: string
}

export interface GitCommitInfo {
  hash: string
  author: string
  date: string
  message: string
}

export class Git {
  /**
   * 获取两个分支之间的变更文件列表
   * sourceBranch 将合入 targetBranch，所以查看 source 相对于 target 的变更
   */
  static async getChangedFiles(sourceBranch: string, targetBranch: string): Promise<string[]> {
    try {
      // 查看 source 分支相对于 target 分支的变更文件
      const output = await ShellExecutor.getOutput($ => $`git diff --name-only ${targetBranch}..${sourceBranch}`)

      if (!output.trim()) {
        return []
      }

      return output.split('\n').filter(line => line.trim().length > 0)
    }
    catch (error) {
      logger.error('获取变更文件失败', error)
      return []
    }
  }

  /**
   * 获取指定文件的 diff 内容
   * sourceBranch 将合入 targetBranch，所以查看 source 相对于 target 的变更
   */
  static async getFileDiff(sourceBranch: string, targetBranch: string, filePath: string): Promise<string> {
    try {
      // 查看 source 分支相对于 target 分支的文件变更
      const output = await ShellExecutor.getOutput($ => $`git diff ${targetBranch}..${sourceBranch} -- "${filePath}"`)
      return output
    }
    catch (error) {
      logger.error(`获取文件 diff 失败: ${filePath}`, error)
      return ''
    }
  }

  /**
   * 获取所有变更文件的 diff 信息
   * sourceBranch 将合入 targetBranch，所以查看 source 相对于 target 的变更
   */
  static async getAllFileDiffs(sourceBranch: string, targetBranch: string): Promise<Record<string, GitDiffInfo>> {
    const changedFiles = await this.getChangedFiles(sourceBranch, targetBranch)
    const diffInfo: Record<string, GitDiffInfo> = {}

    for (const filePath of changedFiles) {
      const diff = await this.getFileDiff(sourceBranch, targetBranch, filePath)
      if (diff) {
        const absolutePath = await ShellExecutor.getOutput($ => $`realpath "${filePath}"`)
        diffInfo[filePath] = {
          absolutePath,
          diff,
        }
      }
    }

    return diffInfo
  }

  /**
   * 获取最近的 commit 信息
   */
  static async getLatestCommit(): Promise<GitCommitInfo | null> {
    try {
      const output = await ShellExecutor.getOutput($ => $`git log -1 --pretty=format:"%H|%an|%ad|%s" --date=iso`)

      if (!output.trim()) {
        return null
      }

      const [hash, author, date, message] = output.split('|')
      return {
        hash,
        author,
        date,
        message,
      }
    }
    catch (error) {
      logger.error('获取最新 commit 信息失败', error)
      return null
    }
  }

  /**
   * 获取两个分支之间的所有 commit 信息
   * sourceBranch 将合入 targetBranch，所以查看 source 相对于 target 的 commit
   */
  static async getCommitsBetweenBranches(sourceBranch: string, targetBranch: string): Promise<GitCommitInfo[]> {
    try {
      // 查看 source 分支相对于 target 分支的 commit
      const output = await ShellExecutor.getOutput($ => $`git log ${targetBranch}..${sourceBranch} --pretty=format:"%H|%an|%ad|%s" --date=iso`)

      if (!output.trim()) {
        return []
      }

      return output.split('\n').map((line) => {
        const [hash, author, date, message] = line.split('|')
        return {
          hash,
          author,
          date,
          message,
        }
      })
    }
    catch (error) {
      logger.error('获取分支间 commit 信息失败', error)
      return []
    }
  }

  /**
   * 检查当前是否在 Git 仓库中
   */
  static async isGitRepository(): Promise<boolean> {
    try {
      await ShellExecutor.getOutput($ => $`ls .git`)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 获取当前分支名称
   */
  static async getCurrentBranch(): Promise<string> {
    try {
      return await ShellExecutor.getOutput($ => $`git branch --show-current`)
    }
    catch (error) {
      logger.error('获取当前分支失败', error)
      return ''
    }
  }

  /**
   * 检查分支是否存在
   */
  static async branchExists(branchName: string): Promise<boolean> {
    try {
      await ShellExecutor.getOutput($ => $`git branch -a | grep -q ${branchName}`)
      return true
    }
    catch {
      return false
    }
  }
}
