import path from 'node:path';
import { config } from 'dotenv';

// Real env vars (CI secrets, shell exports) win over the file.
config({ path: path.resolve(__dirname, '..', '.env.e2e'), quiet: true });

const baseURL = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

/**
 * Defaults only make sense for a throwaway local/CI stack. Against anything
 * else, the setup project would otherwise create a super admin with a
 * password that's committed to this repo — so there, every credential must be
 * set explicitly.
 */
const isLocalTarget = ['localhost', '127.0.0.1'].includes(new URL(baseURL).hostname);

function setting(name: string, localDefault: string): string {
  const value = process.env[name];
  if (value) return value;
  if (isLocalTarget) return localDefault;
  throw new Error(`${name} must be set when BASE_URL (${baseURL}) is not a local address.`);
}

export const env = {
  /** Where the Angular app is served. */
  baseURL,
  /** The Nest API. Same origin as the app in the Docker image; :3000 when using `ng serve`. */
  apiURL: (process.env.API_URL ?? `${baseURL}/api`).replace(/\/$/, ''),
};

export type MemberRole = 'admin' | 'editor' | 'viewer';

export interface Credentials {
  name: string;
  email: string;
  password: string;
}

/**
 * The only credentials the suite needs. Everything is reused across runs:
 * the super admin is created once per database, and the member users are
 * invited into each test's organization with whatever role the test asks for
 * (roles are per-organization, so one user can be a viewer in many orgs).
 */
export const credentials: { superAdmin: Credentials; members: Record<MemberRole, Credentials> } = {
  superAdmin: {
    name: 'E2E Super Admin',
    email: setting('SUPER_ADMIN_EMAIL', 'superadmin@qpon.test'),
    password: setting('SUPER_ADMIN_PASSWORD', 'SuperAdmin#e2e1'),
  },
  members: {
    admin: member('admin'),
    editor: member('editor'),
    viewer: member('viewer'),
  },
};

function member(role: MemberRole): Credentials {
  return {
    name: `E2E ${role[0].toUpperCase()}${role.slice(1)}`,
    email: `e2e-${role}@${setting('E2E_MEMBER_EMAIL_DOMAIN', 'qpon.test')}`,
    password: setting('E2E_MEMBER_PASSWORD', 'Member#e2e1'),
  };
}
