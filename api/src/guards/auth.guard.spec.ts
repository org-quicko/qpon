import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { ApiKeyGuard } from './apiKey.guard';
import { LoggerService } from '../services/logger.service';

function createContext(headers: Record<string, string>): ExecutionContext {
  const request = { headers };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let jwtService: { verifyAsync: ReturnType<typeof vi.fn> };
  let apiKeyGuard: { canActivate: ReturnType<typeof vi.fn> };
  let reflector: { getAllAndOverride: ReturnType<typeof vi.fn> };
  let guard: AuthGuard;

  beforeEach(() => {
    jwtService = { verifyAsync: vi.fn() };
    apiKeyGuard = { canActivate: vi.fn() };
    reflector = { getAllAndOverride: vi.fn().mockReturnValue(false) };
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    guard = new AuthGuard(
      jwtService as unknown as JwtService,
      apiKeyGuard as unknown as ApiKeyGuard,
      reflector as unknown as Reflector,
      logger as unknown as LoggerService,
    );
  });

  it('allows a route marked @Public() without checking credentials', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createContext({});

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('allows a valid bearer token and stamps the userId header', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
    const request = { headers: { authorization: 'Bearer valid.token' } };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.headers).toMatchObject({ userId: 'user-1' });
  });

  it('denies when no token and no API key/secret are present', async () => {
    const context = createContext({});

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('denies an invalid or expired token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));
    const context = createContext({ authorization: 'Bearer expired.token' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('delegates to ApiKeyGuard when x-api-key/x-api-secret headers are present', async () => {
    apiKeyGuard.canActivate.mockResolvedValue(true);
    const context = createContext({
      'x-api-key': 'key',
      'x-api-secret': 'secret',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(apiKeyGuard.canActivate).toHaveBeenCalledWith(context);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });
});
