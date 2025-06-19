import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { TransformInterceptor } from './interceptors/response.interceptor';
import { HttpExceptionFilter } from './exceptionFilters/globalExceptionFilter';
import { UserService } from './services/user.service';
import { LoggerFactory } from '@org-quicko/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        console.error('Validation Errors:', JSON.stringify(errors, null, 2)); // 🔥 Logs errors in detail
        return new BadRequestException(errors);
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new TransformInterceptor(app.get(Reflector)),
  );

  app.enableCors();

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);

  // Check if super admin exists
  const userService = app.get(UserService);
  const response = await userService.superAdminExists();
  if (!response.exists) {
    LoggerFactory.createLogger('logger').info(`Go to localhost:3000/setup to create a super admin`);
  }
}
bootstrap();
