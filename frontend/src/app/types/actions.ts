export const actions = [
  'manage',
  'create',
  'read',
  'read_all',
  'update',
  'delete',
  'change_role',
  'invite_user',
  'remove_user',
] as const;

export type actionsType = (typeof actions)[number];