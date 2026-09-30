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
      }

      if (error instanceof ForbiddenError) {
        // CASL's message names the action and subject that were refused.
        // Returning false here instead would flatten it to Nest's bare
        // "Forbidden resource", which tells a client nothing.
        this.logger.warn(error.message);
        throw new ForbiddenException(error.message);
      }

      // Anything else is a failure while resolving the subject, not an
      // authorization decision. This used to be logged as "User does not have
      // permission to perform this action!" and swallowed, which is how a
      // TypeError could masquerade as a deliberate refusal. Log it as the
      // error it is; still refuse, but without echoing the internal message
      // to the caller.
      this.logger.error('Failed to evaluate permissions', error);
      throw new ForbiddenException();
    }
  }
}
