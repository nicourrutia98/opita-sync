import { Injectable } from '@nestjs/common';
import { PolicyEffect, PolicyTargetType, RoleCode } from '@prisma/client';
import { PrismaService } from '../common/database/prisma.service';
import {
  allPermissionKeys,
  roleCodes,
  rolePermissionMatrix,
  type RoleCode as AppRoleCode,
} from '../common/types/permission.constants';

@Injectable()
export class IdentityAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getPrimaryRole(tenantId: string, userId: string): Promise<AppRoleCode> {
    const roles = await this.prisma.userRole.findMany({
      where: { tenantId, userId },
      orderBy: { assignedAt: 'asc' },
    });

    const role = roles[0]?.roleCode;
    return role ? (role as AppRoleCode) : 'REQUESTER';
  }

  async resolvePermissions(tenantId: string, userId: string, role: AppRoleCode) {
    const base = new Set(rolePermissionMatrix[role]);
    const rolePolicies = await this.prisma.permissionPolicy.findMany({
      where: {
        tenantId,
        targetType: PolicyTargetType.ROLE,
        targetRef: role,
      },
    });
    const userPolicies = await this.prisma.permissionPolicy.findMany({
      where: {
        tenantId,
        targetType: PolicyTargetType.USER,
        targetRef: userId,
      },
    });

    const decisions = new Map<string, PolicyEffect>();
    for (const policy of rolePolicies) {
      decisions.set(policy.permissionKey, policy.effect);
    }
    for (const policy of userPolicies) {
      decisions.set(policy.permissionKey, policy.effect);
    }

    for (const permissionKey of allPermissionKeys) {
      const effect = decisions.get(permissionKey);
      if (effect === PolicyEffect.ALLOW) {
        base.add(permissionKey);
      }
      if (effect === PolicyEffect.DENY) {
        base.delete(permissionKey);
      }
    }

    const explicitDeny = [...decisions.entries()]
      .filter(([, effect]) => effect === PolicyEffect.DENY)
      .map(([permissionKey]) => permissionKey);

    return {
      role,
      permissions: [...base].filter((permission) => !explicitDeny.includes(permission)),
    };
  }

  listRoles() {
    return roleCodes;
  }

  async assignRole(tenantId: string, userId: string, roleCode: AppRoleCode, assignedById?: string) {
    return this.prisma.userRole.upsert({
      where: {
        tenantId_userId_roleCode: {
          tenantId,
          userId,
          roleCode: roleCode as RoleCode,
        },
      },
      update: {
        assignedById: assignedById ?? null,
      },
      create: {
        tenantId,
        userId,
        roleCode: roleCode as RoleCode,
        assignedById: assignedById ?? null,
      },
    });
  }
}
