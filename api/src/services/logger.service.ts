import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsoleLoggerProvider, LoggerFactory } from '@org-quicko/core';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements OnModuleInit {
  private logger: winston.Logger;

  private loggerName = 'logger';

  async onModuleInit() {
    this.logger = await this.getLogger();
  }

  private async getLogger() {
    const existingLogger = LoggerFactory.getLogger(this.loggerName);
    if (existingLogger) {
      return existingLogger;
    }

    const loggerProvider = new ConsoleLoggerProvider();

    const newLogger = await loggerProvider.createLogger();
    LoggerFactory.setLogger(this.loggerName, newLogger);

    return newLogger;
  }

  public info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  public warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  public error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }

  public debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  public verbose(message: string, meta?: any) {
    this.logger.verbose(message, meta);
  }
}
