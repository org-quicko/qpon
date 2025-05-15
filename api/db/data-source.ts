import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

const options = (function (configService: ConfigService): DataSourceOptions {
  return {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: parseInt(configService.get('DB_PORT') ?? '5432'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    synchronize: false,
    logging: configService.get('NODE_ENV') === 'production' ? ['info'] : true,
    poolSize: 10,
    connectTimeoutMS: 2000,
    maxQueryExecutionTime: 5000,
  };
})(configService);

export const AppDataSource = new DataSource({
  ...options,
  entities: ['dist/src/entities/*.js'],
  migrations: ['dist/db/migrations/*.{js,ts}'],
});
