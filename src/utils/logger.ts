import chalk from 'chalk'
import { getEnvConfig } from '../services/config'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private static instance: Logger
  private logLevel: LogLevel

  private constructor() {
    this.logLevel = LogLevel[getEnvConfig().LOG_LEVEL]
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }

  public debug(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      globalThis.console.log(chalk.gray(`[DEBUG] ${message}`), ...args)
    }
  }

  public info(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.INFO) {
      globalThis.console.log(chalk.blue(`[INFO] ${message}`), ...args)
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.WARN) {
      globalThis.console.log(chalk.yellow(`[WARN] ${message}`), ...args)
    }
  }

  public error(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.ERROR) {
      globalThis.console.error(chalk.red(`[ERROR] ${message}`), ...args)
    }
  }

  public success(message: string, ...args: unknown[]): void {
    globalThis.console.log(chalk.green(`[SUCCESS] ${message}`), ...args)
  }
}

export const logger = Logger.getInstance()
