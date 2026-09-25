import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { DataSource } from 'typeorm';
import { ApiKey } from '../../src/entities/api-key.entity';
import { Organization } from '../../src/entities/organization.entity';
import { OrganizationUser } from '../../src/entities/organization-user.entity';
import { User } from '../../src/entities/user.entity';
import { roleEnum } from '../../src/enums';

/**
 * AuthGuard and PermissionGuard are registered as APP_GUARDs, so every
 * request in an HTTP test needs real credentials. These mint them the same
 * way the running system does.
 */

/**
 * Signs a token the way AuthService.login does: the payload is just the user
 * id under `sub`, which AuthGuard copies onto `request.headers.userId` for
 * PermissionGuard to pick up.
 */
export function signAccessToken(app: INestApplication, user: User): string {
  return app.get(JwtService).sign({ sub: user.userId });
}

export function bearer(app: INestApplication, user: User): [string, string] {
  return ['Authorization', `Bearer ${signAccessToken(app, user)}`];
}

/**
 * Creates a user and, when `organization` is given, their membership row with
 * the requested per-org role. `role` on the User itself stays REGULAR unless
 * SUPER_ADMIN is asked for, because a SUPER_ADMIN user is granted
 * `manage all` outright and would mask any per-org rule under test.
 */
export async function createUserWithRole(
  dataSource: DataSource,
  options: {
    role: roleEnum;
    organization?: Organization;
    email?: string;
    password?: string;
  },
): Promise<User> {
  const userRepo = dataSource.getRepository(User);

  const user = await userRepo.save(
    userRepo.create({
      name: `${options.role} user`,
      email: options.email ?? `${options.role}-${randomBytes(6).toString('hex')}@test.local`,
      password: options.password ?? 'password',
      role:
        options.role === roleEnum.SUPER_ADMIN
          ? roleEnum.SUPER_ADMIN
          : roleEnum.REGULAR,
    }),
  );

  if (options.organization) {
    const membershipRepo = dataSource.getRepository(OrganizationUser);
    await membershipRepo.save(
      membershipRepo.create({
        organizationId: options.organization.organizationId,
        user: { userId: user.userId },
        role: options.role,
      }),
    );
  }

  // PermissionGuard loads the user with `organizationUser` relations and
  // AuthorizationService reads them to build the ability; return the same
  // shape so callers can assert against it without a refetch.
  return userRepo.findOneOrFail({
    where: { userId: user.userId },
    relations: { organizationUser: true },
  });
}

export interface ApiKeyCredentials {
  key: string;
  secret: string;
}

/**
 * Inserts an API key for an organization and hands back the plaintext secret.
 * The entity's @BeforeInsert hook hashes `secret` on the way in, which is why
 * the plaintext is only available here at creation time.
 */
export async function createApiKeyCredentials(
  dataSource: DataSource,
  organization: Organization,
): Promise<ApiKeyCredentials> {
  const key = randomBytes(16).toString('hex');
  const secret = randomBytes(32).toString('hex');

  const repo = dataSource.getRepository(ApiKey);
  await repo.save(
    repo.create({
      key,
      secret,
      organization: { organizationId: organization.organizationId },
    }),
  );

  return { key, secret };
}

/** Header pair AuthGuard routes to ApiKeyGuard on. */
export function apiKeyHeaders(credentials: ApiKeyCredentials): Record<string, string> {
  return {
    'x-api-key': credentials.key,
    'x-api-secret': credentials.secret,
  };
}
