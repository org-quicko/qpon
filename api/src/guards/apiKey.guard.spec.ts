import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyGuard } from './apiKey.guard';
import { ApiKeyService } from '../services/api-key.service';
import { LoggerService } from '../services/logger.service';

function createContext(headers: Record<string, string>) {
  const request = { headers };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('ApiKeyGuard', () => {
  let apiKeyService: { validateKeyAndSecret: ReturnType<typeof vi.fn> };
  let guard: ApiKeyGuard;

  beforeEach(() => {
    apiKeyService = { validateKeyAndSecret: vi.fn() };
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    guard = new ApiKeyGuard(
      apiKeyService as unknown as ApiKeyService,
      logger as unknown as LoggerService,
    );
  });

  it('allows a valid key/secret and stamps api_key_id/organization_id headers', async () => {
    apiKeyService.validateKeyAndSecret.mockResolvedValue({
      apiKeyId: 'api-key-1',
      organization: { organizationId: 'org-1' },
    });
    const { context, request } = createContext({
      'x-api-key': 'key',
      'x-api-secret': 'secret',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.headers).toMatchObject({
      api_key_id: 'api-key-1',
      organization_id: 'org-1',
    });
  });

  it('denies an invalid or expired API key/secret', async () => {
    apiKeyService.validateKeyAndSecret.mockResolvedValue(null);
    const { context } = createContext({
      'x-api-key': 'wrong',
      'x-api-secret': 'wrong',
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
