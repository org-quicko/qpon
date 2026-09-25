import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { buildDatabaseConnectionOptions } from '../src/config/database.config';

const configService = new ConfigService();

const options: DataSourceOptions = {
  ...buildDatabaseConnectionOptions(configService),
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'production' ? ['info'] : true,
  poolSize: 10,
  connectTimeoutMS: 2000,
  maxQueryExecutionTime: 5000,
};

export const AppDataSource = new DataSource({
  ...options,
  entities: ['dist/src/entities/*.js'],
  migrations: ['dist/db/migrations/*.{js,ts}'],
});
