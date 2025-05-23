// permission.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  GoneException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForbiddenError } from '@casl/ability';
import {
  AppAbility,
  AuthorizationService,
} from '../services/authorization.service';
import { CHECK_PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { UserService } from '../services/user.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private authorizationService: AuthorizationService,
    private logger: LoggerService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const apiKeyId = request.headers.api_key_id as string;
    const organizationId = request.headers.organization_id as string;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const permissionParams = this.reflector.get(
      CHECK_PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!permissionParams) {
      return true;
    }

    let ability: AppAbility;

    if (apiKeyId) {
      ability = this.authorizationService.getApiUserAbility(organizationId);
    } else {
      const userId = request.headers.userId;

      const user = await this.userService.fetchUserForValidation({ userId });

      if (!user) {
        throw new ForbiddenException('User not authenticated');
      }
      ability = this.authorizationService.getUserAbility(user);
    }

    try {
      const subjectObjects = await this.authorizationService.getSubjectTypes(
        request,
        permissionParams,
      );

      for (let i = 0; i < permissionParams.length; i++) {
        const action = permissionParams[i].action;

        console.log('\n\n', action, subjectObjects[i], '\n\n');

        ForbiddenError.from(ability).throwUnlessCan(action, subjectObjects[i]);
      }

      return true;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof GoneException
      ) {
        this.logger.warn(error.message);
        throw error;
      } else if (error instanceof Error) {
        this.logger.error(
          `User does not have permission to perform this action!`,
        );
      }
      return false;
    }

    return true;
  }
}
