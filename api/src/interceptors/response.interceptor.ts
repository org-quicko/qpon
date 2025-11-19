import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SKIP_TRANSFORM_KEY } from '../decorators/skipTransform.decorator';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response> {
  constructor(private readonly reflector: Reflector) { }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {

    const skipTransform = this.reflector.getAllAndOverride<boolean>(
      SKIP_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTransform) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        return {
          code: context.switchToHttp().getResponse().statusCode,
          message: data.message,
          data: data.result,
        };
      }),
    );
  }
}
