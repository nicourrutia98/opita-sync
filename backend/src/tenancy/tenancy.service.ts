import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InvitationStatus, MembershipStatus, TenantStatus } from '@prisma/client';
import { PrismaService } from '../common/database/prisma.service';
import { IdentityAccessService } from '../identity-access/identity-access.service';
import type { RoleCode } from '../common/types/permission.constants';
import { createHash, randomBytes } from 'node:crypto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TenancyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly identityAccessService: IdentityAccessService,
    private readonly auditService: AuditService,
  ) {}

  async ensureBootstrapTenant() {
    const slug = this.configService.getOrThrow<string>('bootstrap.tenantSlug');
    const existing = await this.prisma.tenant.findUnique({ where: { slug } });

    if (existing) {
      return existing;
    }

    return this.prisma.tenant.create({
      data: {
        slug,
        name: this.configService.getOrThrow<string>('bootstrap.tenantName'),
        timezone: this.configService.getOrThrow<string>('bootstrap.tenantTimezone'),
        status: TenantStatus.ACTIVE,
      },
    });
  }

  async bootstrapFirstUser(userId: string) {
    const tenant = await this.ensureBootstrapTenant();
    const membershipCount = await this.prisma.tenantMembership.count({
      where: { tenantId: tenant.id },
    });

    if (membershipCount > 0) {
      throw new ConflictException('Bootstrap tenant already initialized');
    }

    await this.prisma.tenantMembership.create({
      data: {
        tenantId: tenant.id,
        userId,
        status: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
      },
    });

    await this.identityAccessService.assignRole(tenant.id, userId, 'TENANT_ADMIN');
    return tenant;
  }

  async findMembershipByEmail(tenantId: string, email: string) {
    return this.prisma.tenantInvitation.findFirst({
      where: {
        tenantId,
        email: email.toLowerCase(),
        status: InvitationStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async attachInvitedUser(tenantId: string, userId: string, email: string) {
    const invitation = await this.findMembershipByEmail(tenantId, email);
    if (!invitation) {
      return null;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.tenantMembership.upsert({
        where: {
          tenantId_userId: {
            tenantId,
            userId,
          },
        },
        update: {
          status: MembershipStatus.ACTIVE,
          joinedAt: new Date(),
        },
        create: {
          tenantId,
          userId,
          status: MembershipStatus.ACTIVE,
          joinedAt: new Date(),
          invitedById: invitation.invitedByUserId,
        },
      });

      await tx.userRole.upsert({
        where: {
          tenantId_userId_roleCode: {
            tenantId,
            userId,
            roleCode: invitation.invitedRoleCode,
          },
        },
        update: {
          assignedById: invitation.invitedByUserId,
        },
        create: {
          tenantId,
          userId,
          roleCode: invitation.invitedRoleCode,
          assignedById: invitation.invitedByUserId,
        },
      });

      await tx.tenantInvitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedByUserId: userId,
        },
      });
    });

    return invitation;
  }

  async consumeInvitation(inviteToken: string, userId: string, email: string) {
    const tokenHash = createHash('sha256').update(inviteToken).digest('hex');
    const normalizedEmail = email.toLowerCase();
    const invitation = await this.prisma.tenantInvitation.findFirst({
      where: {
        tokenHash,
        email: normalizedEmail,
        status: InvitationStatus.PENDING,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found or expired');
    }

    await this.attachInvitedUser(invitation.tenantId, userId, normalizedEmail);
    return invitation;
  }

  async resolveTenantContextForUser(userId: string) {
    const membership = await this.prisma.tenantMembership.findFirst({
      where: {
        userId,
        status: MembershipStatus.ACTIVE,
      },
      include: {
        tenant: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (membership) {
      return membership.tenant;
    }

    const bootstrapTenant = await this.ensureBootstrapTenant();
    const hasAnyMembership = await this.prisma.tenantMembership.count();

    if (hasAnyMembership === 0) {
      return this.bootstrapFirstUser(userId);
    }

    throw new NotFoundException('No active tenant membership found for user');
  }

  async listCurrentMembers(tenantId: string) {
    return this.prisma.tenantMembership.findMany({
      where: { tenantId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async inviteMember(tenantId: string, invitedByUserId: string, email: string, roleCode: RoleCode) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const normalizedEmail = email.toLowerCase();

    const invitation = await this.prisma.tenantInvitation.create({
      data: {
        tenantId,
        invitedByUserId,
        email: normalizedEmail,
        invitedRoleCode: roleCode as never,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });

    await this.auditService.record({
      tenantId,
      actorUserId: invitedByUserId,
      actorRoleCode: 'TENANT_ADMIN',
      eventCode: 'tenant.member.invite',
      entityType: 'tenant_invitation',
      entityId: invitation.id,
      resultCode: 'success',
      afterStateJson: {
        email: invitation.email,
        invitedRoleCode: invitation.invitedRoleCode,
      },
    });

    return {
      invitationId: invitation.id,
      email: invitation.email,
      roleCode,
      expiresAt: invitation.expiresAt,
      inviteToken: token,
    };
  }

  async getTenantById(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }
}
