# 开发指南

## 环境要求

- Node.js >= 20.0.0
- pnpm >= 7.0.0

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 设置环境变量

复制 `env.example` 到 `.env` 并配置你的 Gemini API Key：

```bash
cp env.example .env
# 编辑 .env 文件，添加你的 API Key
```

### 3. 开发模式

```bash
# 启动开发模式（使用 tsx 直接执行 TypeScript）
pnpm dev

# 在另一个终端运行测试（一次性）
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

## 项目结构

```
src/
├── core/           # 核心模块
│   ├── config.ts   # 配置管理
│   └── gemini-service.ts  # Gemini 服务（使用 gemini-cli）
├── utils/          # 工具模块
│   ├── logger.ts   # 日志工具
│   ├── shell.ts    # Shell 执行工具
│   └── validators.ts  # 验证工具
├── bin/            # 命令行工具
│   └── index.ts    # 统一入口文件
└── __tests__/      # 测试文件
```

## 代码规范

项目使用 `@antfu/eslint-config` 作为代码规范，主要特点：

- 使用 TypeScript 严格模式
- 支持 ESM 模块
- 自动格式化代码
- 统一的代码风格

## 测试

项目使用 Vitest 作为测试框架，主要特点：

- 原生 ESM 支持
- 极快的执行速度
- 内置 TypeScript 支持
- 丰富的断言 API
- 内置覆盖率报告

## 类型验证

项目使用 Zod 进行运行时类型验证，主要特点：

- 强大的类型推断
- 运行时类型安全
- 丰富的验证规则
- 自动错误消息
- TypeScript 友好

### Zod 使用示例

```typescript
import { z } from 'zod';

// 定义验证模式
const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0).max(120),
});

// 验证数据
const result = UserSchema.safeParse(data);
if (result.success) {
  // 类型安全的数据
  const user = result.data;
} else {
  // 详细的错误信息
  console.error(result.error.errors);
}
```

### 常用命令

```bash
# 检查代码
pnpm lint

# 自动修复
pnpm lint:fix

# 运行测试（一次性）
pnpm test

# 构建项目
pnpm build
```

## 添加新功能

### 1. 添加新的功能模块

1. 在 `src/core/` 或 `src/utils/` 创建新的模块文件
2. 在 `src/index.ts` 导出新模块
3. 在 `src/bin/index.ts` 添加新功能
4. 更新 README.md 文档

### 2. 添加新的工具函数

1. 在 `src/utils/` 创建新的工具文件
2. 在 `src/index.ts` 导出新模块
3. 添加相应的测试文件

### 3. 添加新的依赖

```bash
# 添加生产依赖
pnpm add <package-name>

# 添加开发依赖
pnpm add -D <package-name>
```

## 发布流程

### 1. 准备发布

```bash
# 清理构建文件
pnpm clean

# 构建项目
pnpm build

# 运行测试
pnpm test

# 检查代码
pnpm lint
```

### 2. 发布到 npm

```bash
# 登录 npm（如果还没有）
npm login

# 发布
npm publish
```

## 故障排除

### 常见问题

1. **TypeScript 编译错误**
   - 检查 `tsconfig.json` 配置
   - 确保所有导入路径正确

2. **ESLint 错误**
   - 运行 `pnpm lint:fix` 自动修复
   - 检查 `.eslintrc.js` 配置

3. **测试失败**
   - 检查测试文件语法
   - 确保所有依赖已安装

4. **构建失败**
   - 清理 `dist/` 目录
   - 重新安装依赖

### 调试技巧

```bash
# 查看详细的构建信息
pnpm build --verbose

# 运行单个测试文件
pnpm test src/__tests__/shell.test.ts

# 检查依赖树
pnpm list
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

请确保：
- 代码通过所有测试
- 符合 ESLint 规范
- 更新相关文档
- 添加必要的测试
