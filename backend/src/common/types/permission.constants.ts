export const roleCodes = [
  'TENANT_ADMIN',
  'SUPERVISOR',
  'TECHNICIAN',
  'REQUESTER',
] as const;

export type RoleCode = (typeof roleCodes)[number];

export const rolePermissionMatrix: Record<RoleCode, string[]> = {
  TENANT_ADMIN: [
    'tenant.manage_members',
    'tenant.manage_settings',
    'conversation.create',
    'conversation.read',
    'conversation.write',
    'conversation.summarize',
    'case.read',
    'case.create',
    'case.update',
    'audit.read',
    'trace.read',
    'tool.read_registry',
    'tool.read_execution',
    'tool.manage_registry',
    'tool.review',
    'tool.certify',
    'tool.promote',
    'tool.deprecate',
    'tool.confirm_execution',
    'positive_action.read',
  ],
  SUPERVISOR: [
    'conversation.create',
    'conversation.read',
    'conversation.write',
    'conversation.summarize',
    'case.read',
    'case.create',
    'case.update',
    'audit.read',
    'tool.read_execution',
    'tool.confirm_execution',
    'positive_action.read',
  ],
  TECHNICIAN: [
    'conversation.create',
    'conversation.read',
    'conversation.write',
    'conversation.summarize',
    'case.read',
    'case.update',
  ],
  REQUESTER: [
    'conversation.create',
    'conversation.read',
    'conversation.write',
    'case.read',
    'case.create',
    'tool.confirm_execution',
  ],
};

export const allPermissionKeys = [
  ...new Set(Object.values(rolePermissionMatrix).flat()),
];
