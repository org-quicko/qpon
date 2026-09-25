import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { buildDatabaseConnectionOptions } from './database.config';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  ...buildDatabaseConnectionOptions(configService),
  autoLoadEntities: true,
  synchronize: configService.get('NODE_ENV') !== 'production',
  logging: configService.get('NODE_ENV') === 'production' ? ['info'] : true,
  poolSize: 10,
  connectTimeoutMS: 2000,
  maxQueryExecutionTime: 5000,
});
