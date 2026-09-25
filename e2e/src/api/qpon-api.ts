import type { APIRequestContext, APIResponse } from '@playwright/test';
import { env, type Credentials, type MemberRole } from '../env';

export interface Organization {
  organizationId: string;
  name: string;
}

export interface Item {
  itemId: string;
  name: string;
  description?: string;
  externalId: string;
  customFields?: Record<string, string>;
}

export type NewItem = Omit<Item, 'itemId'>;

/**
 * Minimal client for arranging test data. It talks to the same endpoints the
 * app does, so fixtures build state the way a user (or integration) would —
 * never by writing to the database directly, which keeps the suite runnable
 * against any deployed environment.
 */
export class QponApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token?: string,
  ) {}

  /** Returns a client authenticated as `user`. */
  static async signIn(request: APIRequestContext, user: Credentials): Promise<QponApi> {
    return new QponApi(request, await QponApi.accessToken(request, user));
  }

  static async accessToken(request: APIRequestContext, user: Credentials): Promise<string> {
    const data = await unwrap<{ access_token: string }>(
      `sign in as ${user.email}`,
      request.post(`${env.apiURL}/users/login`, {
        data: { email: user.email, password: user.password },
      }),
    );
    return data.access_token;
  }

  async superAdminExists(): Promise<boolean> {
    const data = await unwrap<{ exists: boolean }>(
      'check for a super admin',
      this.request.get(`${env.apiURL}/super-admin/exists`),
    );
    return data.exists;
  }

  async createSuperAdmin(user: Credentials): Promise<void> {
    await unwrap('create the super admin', this.request.post(`${env.apiURL}/users`, {
      data: {
        '@entity': 'org.quicko.qpon.user',
        name: user.name,
        email: user.email,
        password: user.password,
        role: 'super_admin',
      },
    }));
  }

  async createOrganization(name: string): Promise<Organization> {
    const data = await unwrap<{ organization_id: string; name: string }>(
      `create organization "${name}"`,
      this.request.post(`${env.apiURL}/organizations`, {
        headers: this.auth(),
        data: { '@entity': 'org.quicko.qpon.organization', name, currency: 'INR' },
      }),
    );
    return { organizationId: data.organization_id, name: data.name };
  }

  /** Deletes the organization and — via FK cascades — everything in it. */
  async deleteOrganization(organizationId: string): Promise<void> {
    await unwrap(`delete organization ${organizationId}`, this.request.delete(
      `${env.apiURL}/organizations/${organizationId}`,
      { headers: this.auth() },
    ));
  }

  /** Invites `user`; if they already exist, this just adds the membership. */
  async addMember(organizationId: string, user: Credentials, role: MemberRole): Promise<void> {
    await unwrap(`add ${user.email} as ${role}`, this.request.post(
      `${env.apiURL}/organizations/${organizationId}/users`,
      {
        headers: this.auth(),
        data: {
          '@entity': 'org.quicko.qpon.user',
          name: user.name,
          email: user.email,
          password: user.password,
          role,
        },
      },
    ));
  }

  async createItem(organizationId: string, item: NewItem): Promise<Item> {
    const data = await unwrap<{ item_id: string }>(
      `create item "${item.name}"`,
      this.request.post(`${env.apiURL}/organizations/${organizationId}/items`, {
        headers: this.auth(),
        data: {
          '@entity': 'org.quicko.qpon.item',
          name: item.name,
          description: item.description,
          external_id: item.externalId,
          custom_fields: item.customFields,
        },
      }),
    );
    return { ...item, itemId: data.item_id };
  }

  private auth(): Record<string, string> {
    if (!this.token) throw new Error('This QponApi client is not signed in.');
    return { Authorization: `Bearer ${this.token}` };
  }
}

/** Unwraps the API's `{ code, message, data }` envelope, failing loudly with the response body. */
async function unwrap<T = unknown>(action: string, pending: Promise<APIResponse>): Promise<T> {
  const response = await pending;
  if (!response.ok()) {
    throw new Error(`Could not ${action}: ${response.status()} ${await response.text()}`);
  }
  const body = (await response.json()) as { data: T };
  return body.data;
}
