import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs/operators';
import { snakeCase } from 'lodash';
import { Observable } from 'rxjs';
import { SKIP_TRANSFORM_KEY } from '../decorators/skipTransform.decorator';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response> {
    const skipTransform = this.reflector.getAllAndOverride<boolean>(
      SKIP_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTransform) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        const response = {
          code: context.switchToHttp().getResponse().statusCode,
          message: data.message,
          data: this.convertToSnakeCase(data.result),
        };

        return this.convertToSnakeCase(response);
      }),
    );
  }

  private convertToSnakeCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertToSnakeCase(item));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          snakeCase(key),
          this.convertToSnakeCase(value),
        ]),
      );
    }
    return obj;
  }
}
