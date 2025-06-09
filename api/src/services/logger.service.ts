import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerFactory, LoggingLevel } from '@org-quicko/core';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements OnModuleInit {
  private logger: winston.Logger;

  private loggerName = 'logger';

  onModuleInit() {
    this.logger = this.getLogger();
  }

  private getLogger() {
    return LoggerFactory.createLogger(this.loggerName, LoggingLevel.info)
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
