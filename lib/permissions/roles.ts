export const workspaceRoles = [
  "owner",
  "admin",
  "manager",
  "member",
  "viewer",
] as const;

export type WorkspaceRole = (typeof workspaceRoles)[number];

const hierarchy: Record<WorkspaceRole, number> = {
  owner: 5,
  admin: 4,
  manager: 3,
  member: 2,
  viewer: 1,
};

export function hasMinimumRole(
  currentRole: WorkspaceRole,
  minimumRole: WorkspaceRole,
) {
  return hierarchy[currentRole] >= hierarchy[minimumRole];
}
