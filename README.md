# Gemini Tools

一个基于 Google Gemini AI 的现代化命令行工具集，提供代码 Review、测试生成、文档生成和代码重构功能。

## ✨ 特性

- 🔍 **PR 代码 Review**: 基于 Git diff 进行 PR 代码审查
- 📁 **模块代码 Review**: 对指定文件或目录进行代码审查
- 🧪 **单元测试生成**: 自动生成单元测试用例
- 🚀 **E2E 测试生成**: 生成端到端测试用例
- 📚 **文档生成**: 自动生成项目文档
- 🔧 **代码重构**: 智能代码重构建议
- 🎯 **命令行模式**: 简洁的命令行接口，适合脚本化使用
- 🚀 **现代工具链**: 使用 tsup 构建，vitest 测试
- 📦 **ESM 支持**: 原生 ESM 模块，支持现代 JavaScript 特性
- 🛡️ **类型安全**: 使用 Zod 进行运行时类型验证
- 🎨 **代码规范**: 使用 @antfu/eslint-config 保持代码质量

## 📋 环境要求

- **Node.js**: >= 20.0.0
- **pnpm**: >= 7.0.0
- **@google/gemini-cli**: 需要全局安装

## 🚀 快速开始

### 1. 安装

```bash
# 全局安装
npm install -g gemini-tools

# 或者使用 pnpm
pnpm add -g gemini-tools

# 安装 @google/gemini-cli（必需）
npm install -g @google/gemini-cli
```

### 2. 配置

创建 `.env` 文件：

```bash
# 复制示例配置
cp env.example .env

# 编辑配置
vim .env
```

配置内容：

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-pro
NODE_ENV=development
LOG_LEVEL=info
```

**注意**: 本项目使用 ESM 格式，需要 Node.js 20+ 版本，并且需要安装 @google/gemini-cli。

## 💡 使用方法

### PR 代码 Review

```bash
# 基本 PR Review
gemini-tools pr-review -s feature-branch -t main

# 指定输出文件
gemini-tools pr-review -s feature-branch -t main -o review-report.md

# 自定义模型
gemini-tools pr-review -s feature-branch -t main -m gemini-pro

# 添加自定义提示词
gemini-tools pr-review -s feature-branch -t main --additional-prompts "重点关注性能问题" "检查安全漏洞"

# 忽略特定文件
gemini-tools pr-review -s feature-branch -t main --ignore "*.test.js" "node_modules/**"
```

### 模块代码 Review

```bash
# 审查单个文件
gemini-tools module-review -i src/main.js

# 审查多个文件
gemini-tools module-review -i src/main.js src/utils.js

# 指定输出文件
gemini-tools module-review -i src/main.js -o module-review.md

# 自定义模型和提示词
gemini-tools module-review -i src/main.js -m gemini-pro --additional-prompts "检查代码规范" "分析复杂度"
```

### 单元测试生成

```bash
# 为单个文件生成单元测试
gemini-tools unit-test -i src/main.js -o tests/main.test.js

# 为整个目录生成测试
gemini-tools unit-test -i src/ -o tests/

# 自定义测试生成规则
gemini-tools unit-test -i src/main.js -o tests/main.test.js --additional-prompts "使用 Jest 框架" "包含边界条件测试"

# 忽略特定文件模式
gemini-tools unit-test -i src/ -o tests/ --ignore "*.test.js" "node_modules/**"
```

### E2E 测试生成

```bash
# 生成 E2E 测试（功能待实现）
gemini-tools e2e-test src/app.js -o tests/e2e/app.test.js
```

### 文档生成

```bash
# 生成项目文档（功能待实现）
gemini-tools doc src/main.js -o docs/main.md
```

### 代码重构

```bash
# 代码重构（功能待实现）
gemini-tools refactor src/main.js -o src/main.refactored.js
```

## 🎛️ 命令行选项

### PR Review 命令

| 选项 | 简写 | 描述 | 必需 |
|------|------|------|------|
| `--source-branch` | `-s` | 源分支名称 | ✅ |
| `--target-branch` | `-t` | 目标分支名称 | ✅ |
| `--output` | `-o` | 输出文件路径 | ❌ |
| `--model` | `-m` | 模型名称 | ❌ |
| `--additional-prompts` | - | 自定义提示词 | ❌ |
| `--ignore` | - | 忽略文件路径 | ❌ |

### Module Review 命令

| 选项 | 简写 | 描述 | 必需 |
|------|------|------|------|
| `--input` | `-i` | 输入文件路径（支持多个） | ✅ |
| `--output` | `-o` | 输出文件路径 | ❌ |
| `--model` | `-m` | 模型名称 | ❌ |
| `--additional-prompts` | - | 自定义提示词 | ❌ |
| `--ignore` | - | 忽略文件路径 | ❌ |

### Unit Test 命令

| 选项 | 简写 | 描述 | 必需 |
|------|------|------|------|
| `--input` | `-i` | 输入路径（文件或目录） | ✅ |
| `--output` | `-o` | 输出文件路径 | ✅ |
| `--model` | `-m` | 模型名称 | ❌ |
| `--additional-prompts` | - | 自定义提示词 | ❌ |
| `--ignore` | - | 忽略文件模式 | ❌ |

## 🛠️ 开发

### 环境准备

```bash
# 克隆项目
git clone https://github.com/yourusername/gemini-tools.git
cd gemini-tools

# 安装依赖
pnpm install

# 配置环境变量
cp env.example .env
# 编辑 .env 文件，添加你的 API Key

# 确保已安装 @google/gemini-cli
npm install -g @google/gemini-cli
```

### 开发命令

```bash
# 构建项目
pnpm build

# 开发模式
pnpm dev

# 运行测试（一次性）
pnpm test

# 运行测试（监听模式）
pnpm test:watch

# 生成测试覆盖率报告
pnpm test:coverage

# 代码检查
pnpm lint

# 自动修复代码问题
pnpm lint:fix
```

### 项目结构

```
src/
├── bin/            # 命令行工具
│   └── index.ts    # 统一入口文件
├── core/           # 核心模块
│   ├── review/     # 代码审查功能
│   │   ├── pr.ts   # PR Review
│   │   └── module.ts # 模块 Review
│   └── test/       # 测试生成功能
│       └── unit.ts # 单元测试生成
├── services/       # 服务层
│   ├── gemini.ts   # Gemini AI 服务
│   └── config.ts   # 配置管理
├── utils/          # 工具模块
│   ├── logger.ts   # 日志工具
│   ├── fs.ts       # 文件系统工具
│   ├── git.ts      # Git 工具
│   ├── prompt.ts   # 提示词处理
│   ├── shell.ts    # Shell 执行工具
│   └── validators.ts  # 验证工具
└── __tests__/      # 测试文件
```

## 🎯 开发环境

| 工具 | 版本 | 用途 |
|------|------|------|
| **Node.js** | >= 20.0.0 | 运行时环境 |
| **pnpm** | >= 7.0.0 | 包管理器 |
| **@google/gemini-cli** | 最新版本 | Gemini CLI 工具 |
| **TypeScript** | v5.8.3 | 类型系统 |
| **ESLint** | @antfu/eslint-config | 代码规范 |
| **Vitest** | v3.2.4 | 测试框架 |
| **tsup** | v8.5.0 | 构建工具 |
| **Zod** | v4.0.10 | 类型验证 |

## 📝 示例

### 1. PR Review 示例

```bash
# 基本 PR Review
gemini-tools pr-review -s feature/new-feature -t main

# 带自定义规则的 Review
gemini-tools pr-review -s feature/new-feature -t main \
  --additional-prompts "检查 TypeScript 类型安全" "关注性能优化" \
  --ignore "*.test.ts" "docs/**"
```

### 2. 模块 Review 示例

```bash
# 审查核心模块
gemini-tools module-review -i src/core/ -o reviews/core-review.md

# 审查特定文件
gemini-tools module-review -i src/services/gemini.ts src/utils/logger.ts
```

### 3. 单元测试生成示例

```bash
# 为工具函数生成测试
gemini-tools unit-test -i src/utils/validators.ts -o tests/utils/validators.test.ts

# 为整个服务模块生成测试
gemini-tools unit-test -i src/services/ -o tests/services/ \
  --additional-prompts "使用 Vitest 框架" "包含错误处理测试"
```

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 开发指南

- 遵循现有的代码风格
- 添加适当的测试
- 更新相关文档
- 确保所有测试通过

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Google Gemini AI](https://ai.google.dev/) - 提供强大的 AI 能力
- [@antfu/eslint-config](https://github.com/antfu/eslint-config) - 优秀的代码规范配置
- [Vitest](https://vitest.dev/) - 快速的测试框架
- [tsup](https://github.com/egoist/tsup) - 零配置的 TypeScript 构建工具

## 📞 支持

如果你遇到问题或有建议，请：

- 📧 创建 [Issue](https://github.com/yourusername/gemini-tools/issues)

---

**享受使用 Gemini Tools！** 🚀
