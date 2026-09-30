import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createMongoAbility } from '@casl/ability';
import { PermissionGuard } from './permission.guard';
import { UserService } from '../services/user.service';
import { AuthorizationService } from '../services/authorization.service';
import { LoggerService } from '../services/logger.service';

function createContext(headers: Record<string, string>): ExecutionContext {
  const request = { headers };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('PermissionGuard', () => {
  let reflector: {
    getAllAndOverride: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
  };
  let userService: { fetchUserForValidation: ReturnType<typeof vi.fn> };
  let authorizationService: {
    getUserAbility: ReturnType<typeof vi.fn>;
    getApiUserAbility: ReturnType<typeof vi.fn>;
    getSubjectTypes: ReturnType<typeof vi.fn>;
  };
  let guard: PermissionGuard;

  const permissionParams = [{ action: 'read', subject: 'Coupon' }];

  beforeEach(() => {
    reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(false),
      get: vi.fn().mockReturnValue(permissionParams),
    };
    userService = {
      fetchUserForValidation: vi.fn().mockResolvedValue({ userId: 'user-1' }),
    };
    authorizationService = {
      getUserAbility: vi.fn(),
      getApiUserAbility: vi.fn(),
      getSubjectTypes: vi.fn().mockResolvedValue(['Coupon']),
    };
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    guard = new PermissionGuard(
      reflector as unknown as Reflector,
      userService as unknown as UserService,
      authorizationService as unknown as AuthorizationService,
      logger as unknown as LoggerService,
    );
  });

  it('allows a route marked @Public() without checking permissions', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createContext({ userId: 'user-1' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authorizationService.getSubjectTypes).not.toHaveBeenCalled();
  });

  it('allows a handler with no @Permissions() metadata', async () => {
    reflector.get.mockReturnValue(undefined);
    const context = createContext({ userId: 'user-1' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('allows when the CASL ability grants the required action', async () => {
    authorizationService.getUserAbility.mockReturnValue(
      createMongoAbility([{ action: 'read', subject: 'Coupon' }]),
    );
    const context = createContext({ userId: 'user-1' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('denies when the CASL ability does not grant the required action', async () => {
    authorizationService.getUserAbility.mockReturnValue(
      createMongoAbility([{ action: 'read', subject: 'Campaign' }]),
    );
    const context = createContext({ userId: 'user-1' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('carries CASL’s reason through to the refusal', async () => {
    authorizationService.getUserAbility.mockReturnValue(
      createMongoAbility([{ action: 'read', subject: 'Campaign' }]),
    );
    const context = createContext({ userId: 'user-1' });

    // The guard used to `return false`, which Nest flattens to a bare
    // "Forbidden resource"; CASL's message names the action and subject.
    await expect(guard.canActivate(context)).rejects.toThrow(/Cannot execute/);
  });

  it('refuses without leaking the internal message when subject resolution fails', async () => {
    authorizationService.getSubjectTypes.mockRejectedValue(
      new TypeError("Cannot read properties of null (reading 'constructor')"),
    );
    const context = createContext({ userId: 'user-1' });

    const error = await guard.canActivate(context).catch((e: Error) => e);

    expect(error).toBeInstanceOf(ForbiddenException);
    expect((error as Error).message).not.toContain('constructor');
  });

  it('throws when no user is found for the request (not authenticated)', async () => {
    userService.fetchUserForValidation.mockResolvedValue(null);
    const context = createContext({ userId: 'missing-user' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('uses the API-key ability when the request carries an api_key_id header', async () => {
    authorizationService.getApiUserAbility.mockReturnValue(
      createMongoAbility([{ action: 'read', subject: 'Coupon' }]),
    );
    const context = createContext({
      api_key_id: 'key-1',
      organization_id: 'org-1',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authorizationService.getApiUserAbility).toHaveBeenCalledWith(
      'org-1',
    );
    expect(userService.fetchUserForValidation).not.toHaveBeenCalled();
  });
});
