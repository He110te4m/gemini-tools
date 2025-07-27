# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup
- Gemini AI integration via gemini-cli
- Unified command line tool with multiple modes (chat, code, analyze, shell)
- Shell execution capabilities with zx
- Zod validation for type safety
- ESM module support
- Comprehensive testing setup
- Pre-commit hooks with lint-staged and commitlint
- Automated release process with bumpp

### Changed
- Migrated to ESM format
- Switched from npm to pnpm package manager
- Replaced Prettier with @antfu/eslint-config
- Replaced custom validators with Zod
- Switched release tool to bumpp
- Replaced direct Gemini API integration with gemini-cli
- Switched build tool from TypeScript compiler to tsup
- Switched dev mode to use tsx for direct TypeScript execution
- Switched test framework from Jest to Vitest
- Removed interactive mode and inquirer dependency
- Upgraded to latest dependency versions (commander v14, vitest v3, etc.)
- Set minimum Node.js version to 20+ for modern features

### Deprecated
- N/A

### Removed
- Interactive mode functionality
- inquirer dependency
- @types/inquirer dependency

### Fixed
- N/A

### Security
- N/A
