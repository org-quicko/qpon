import 'reflect-metadata';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { classToPlain, plainToInstance } from 'class-transformer';
import { AppModule } from './app.module';
import { TransformInterceptor } from './interceptors/response.interceptor';
import { HttpExceptionFilter } from './exceptionFilters/globalExceptionFilter';

/**
 * Every global the HTTP surface depends on — validation, the error shape, the
 * `{ code, message, data }` envelope and the `/api` prefix.
 *
 * This lives apart from `main.ts` so the test harness boots a app configured
 * exactly like production. When it was inlined in `bootstrap()`, a Nest app
 * created via `Test.createTestingModule(...).createNestApplication()` had none
 * of it, so no test could assert on validation, error bodies or the envelope.
 */
export function configureApp(app: INestApplication): INestApplication {
  // Lets class-validator resolve custom constraint classes out of the Nest
  // container (so validators can inject services).
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        console.error('Validation Errors:', JSON.stringify(errors, null, 2));
        return new BadRequestException(errors);
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      transformerPackage: {
        plainToInstance: plainToInstance,
        classToPlain: classToPlain,
      },
    }),
    new TransformInterceptor(app.get(Reflector)),
  );

  app.enableCors();

  app.setGlobalPrefix('api');

  return app;
}
