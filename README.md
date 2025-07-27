# Gemini Tools

一个基于 Google Gemini AI 的现代化命令行工具集，提供聊天、代码生成、代码分析和 Shell 执行功能。

## ✨ 特性

- 🤖 **AI 聊天**: 与 Gemini AI 进行自然语言对话
- 💻 **代码生成**: 根据描述生成各种编程语言的代码
- 🔍 **代码分析**: 分析代码的复杂度、安全性、性能和风格
- ⚡ **Shell 执行**: 智能执行和优化 Shell 命令
- 🎯 **命令行模式**: 简洁的命令行接口，适合脚本化使用
- 🔧 **gemini-cli 集成**: 使用 gemini-cli 进行模型调用
- 🚀 **现代工具链**: 使用 tsup 构建，tsx 开发，vitest 测试
- 📦 **ESM 支持**: 原生 ESM 模块，支持现代 JavaScript 特性
- 🛡️ **类型安全**: 使用 Zod 进行运行时类型验证
- 🎨 **代码规范**: 使用 @antfu/eslint-config 保持代码质量

## 📋 环境要求

- **Node.js**: >= 20.0.0
- **pnpm**: >= 7.0.0
- **gemini-cli**: 需要全局安装

## 🚀 快速开始

### 1. 安装

```bash
# 全局安装
npm install -g gemini-tools

# 或者使用 pnpm
pnpm add -g gemini-tools

# 安装 gemini-cli（必需）
npm install -g gemini-cli
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
GEMINI_MODEL=gemini-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=2048
NODE_ENV=development
LOG_LEVEL=info
```

**注意**: 本项目使用 ESM 格式，需要 Node.js 20+ 版本，并且需要安装 gemini-cli。

## 💡 使用方法

### 聊天模式

```bash
# 简单聊天
gemini-tools -m chat -p "你好，请介绍一下自己"

# 复杂对话
gemini-tools -m chat -p "请帮我分析一下这段代码的性能问题：function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }"
```

### 代码生成模式

```bash
# 生成 Python 快速排序
gemini-tools -m code -p "实现一个快速排序算法" -l "python" -o "quicksort.py"

# 生成 React 组件
gemini-tools -m code -p "创建一个 React 计数器组件" -l "javascript" -o "Counter.jsx"

# 生成 TypeScript 类型定义
gemini-tools -m code -p "定义用户接口类型" -l "typescript"
```

### 代码分析模式

```bash
# 分析 JavaScript 文件
gemini-tools -m analyze -f "src/main.js" -l "javascript"

# 分析 Python 文件的安全性
gemini-tools -m analyze -f "app.py" -l "python" -t "security"

# 分析代码性能
gemini-tools -m analyze -f "algorithm.js" -l "javascript" -t "performance"
```

### Shell 执行模式

```bash
# 查找并统计文件
gemini-tools -m shell -p "查找所有 .js 文件并统计行数"

# 系统信息
gemini-tools -m shell -p "显示系统内存和磁盘使用情况"

# 安全模式执行
gemini-tools -m shell -p "删除临时文件" -s
```

## 📊 分析类型

| 类型 | 描述 | 适用场景 |
|------|------|----------|
| `complexity` | 复杂度分析 | 算法优化、代码重构 |
| `security` | 安全性分析 | 安全审计、漏洞检测 |
| `performance` | 性能分析 | 性能优化、瓶颈识别 |
| `style` | 代码风格分析 | 代码审查、规范检查 |
| `comprehensive` | 综合分析 | 全面评估、质量检查 |

## 🎛️ 命令行选项

### 通用选项

| 选项 | 简写 | 描述 | 示例 |
|------|------|------|------|
| `--mode` | `-m` | 运行模式 | `chat\|code\|analyze\|shell` |
| `--prompt` | `-p` | 输入提示或消息 | `"你的提示内容"` |
| `--file` | `-f` | 文件路径 | `src/main.js` |
| `--language` | `-l` | 编程语言 | `javascript\|python\|typescript` |
| `--output` | `-o` | 输出文件路径 | `output.js` |
| `--type` | `-t` | 分析类型 | `complexity\|security\|performance` |
| `--safe` | `-s` | 安全模式 | Shell 执行时确认 |

### 模式说明

- **`chat`**: 与 AI 进行自然语言对话
- **`code`**: 根据描述生成代码
- **`analyze`**: 分析现有代码
- **`shell`**: 执行和优化 Shell 命令

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
```

### 开发命令

```bash
# 构建项目
pnpm build

# 开发模式（使用 tsx 直接执行 TypeScript）
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
├── core/           # 核心模块
│   ├── config.ts   # 配置管理
│   └── gemini-service.ts  # Gemini 服务
├── utils/          # 工具模块
│   ├── logger.ts   # 日志工具
│   ├── shell.ts    # Shell 执行工具
│   └── validators.ts  # 验证工具
├── bin/            # 命令行工具
│   └── index.ts    # 统一入口文件
└── __tests__/      # 测试文件
```

## 🎯 开发环境

| 工具 | 版本 | 用途 |
|------|------|------|
| **Node.js** | >= 20.0.0 | 运行时环境 |
| **pnpm** | >= 7.0.0 | 包管理器 |
| **TypeScript** | v5.8.3 | 类型系统 |
| **ESLint** | @antfu/eslint-config | 代码规范 |
| **Vitest** | v3.2.4 | 测试框架 |
| **tsup** | v8.5.0 | 构建工具 |
| **tsx** | v4.20.3 | 开发执行 |
| **Zod** | v4.0.10 | 类型验证 |

## 📝 示例

### 1. 代码生成示例

```bash
# 生成一个 React Hook
gemini-tools -m code -p "创建一个自定义 Hook 用于管理表单状态" -l "typescript" -o "useForm.ts"

# 生成 API 客户端
gemini-tools -m code -p "创建一个 REST API 客户端类" -l "python" -o "api_client.py"
```

### 2. 代码分析示例

```bash
# 分析算法复杂度
gemini-tools -m analyze -f "sorting.js" -l "javascript" -t "complexity"

# 安全审计
gemini-tools -m analyze -f "auth.js" -l "javascript" -t "security"

# 性能优化建议
gemini-tools -m analyze -f "database.js" -l "javascript" -t "performance"
```

### 3. Shell 命令优化

```bash
# 优化文件查找命令
gemini-tools -m shell -p "查找所有 .log 文件并删除超过 30 天的"

# 系统监控
gemini-tools -m shell -p "监控 CPU 和内存使用情况，超过阈值时发送通知"
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
- 💬 参与 [Discussions](https://github.com/yourusername/gemini-tools/discussions)
- 📖 查看 [Wiki](https://github.com/yourusername/gemini-tools/wiki)

---

**享受使用 Gemini Tools！** 🚀
