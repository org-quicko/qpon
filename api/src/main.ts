import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app-setup';
import { UserService } from './services/user.service';
import { LoggerFactory } from '@org-quicko/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  await app.listen(process.env.PORT ?? 3000);

  // Check if super admin exists
  const userService = app.get(UserService);
  const response = await userService.superAdminExists();
  if (!response.exists) {
    LoggerFactory.createLogger('logger').info(`Go to localhost:3000/setup to create a super admin`);
  }
}
void bootstrap();
