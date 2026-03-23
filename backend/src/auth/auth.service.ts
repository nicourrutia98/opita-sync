import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/database/prisma.service';
import { FirebaseIdentityService } from './firebase-identity.service';
import { TenancyService } from '../tenancy/tenancy.service';
import { IdentityAccessService } from '../identity-access/identity-access.service';
import { InternalSessionService } from './internal-session.service';
import { AuditService } from '../audit/audit.service';
import { UpdateUiProfileDto } from './dto/update-ui-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseIdentityService: FirebaseIdentityService,
    private readonly tenancyService: TenancyService,
    private readonly identityAccessService: IdentityAccessService,
    private readonly internalSessionService: InternalSessionService,
    private readonly auditService: AuditService,
  ) {}

  async exchangeFirebaseToken(firebaseIdToken: string, inviteToken?: string) {
    const decodedToken =
      await this.firebaseIdentityService.verifyIdToken(firebaseIdToken);

    const email = decodedToken.email?.toLowerCase() ?? null;

    const user = await this.prisma.user.upsert({
      where: {
        firebaseUid: decodedToken.uid,
      },
      update: {
        displayName:
          decodedToken.name ?? decodedToken.email ?? decodedToken.phone_number ?? 'Unnamed user',
        email,
        phoneNumber: decodedToken.phone_number ?? null,
        externalRef: decodedToken.uid,
      },
      create: {
        firebaseUid: decodedToken.uid,
        externalRef: decodedToken.uid,
        displayName:
          decodedToken.name ?? decodedToken.email ?? decodedToken.phone_number ?? 'Unnamed user',
        email,
        phoneNumber: decodedToken.phone_number ?? null,
      },
    });

    if (email && inviteToken) {
      await this.tenancyService.consumeInvitation(inviteToken, user.id, email);
    }

    const tenant = await this.tenancyService.resolveTenantContextForUser(user.id);

    const role = await this.identityAccessService.getPrimaryRole(tenant.id, user.id);
    const access = await this.identityAccessService.resolvePermissions(
      tenant.id,
      user.id,
      role,
    );
    const session = await this.internalSessionService.issueSession({
      userId: user.id,
      tenantId: tenant.id,
      role: access.role,
      sessionId: '',
      permissionsVersion: 1,
      permissions: access.permissions,
    });

    await this.auditService.record({
      tenantId: tenant.id,
      actorUserId: user.id,
      actorRoleCode: access.role,
      eventCode: 'auth.firebase.exchange',
      entityType: 'session',
      entityId: session.sessionId,
      resultCode: 'success',
    });

    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresIn: session.expiresIn,
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
      role: access.role,
      permissions: access.permissions,
    };
  }

  async refresh(refreshToken: string) {
    return this.internalSessionService.refreshSession(refreshToken, async (previousSessionId) => {
      const previousSession = await this.prisma.session.findUnique({
        where: { id: previousSessionId },
      });

      if (!previousSession) {
        throw new NotFoundException('Previous session not found');
      }

      const role = await this.identityAccessService.getPrimaryRole(
        previousSession.tenantId,
        previousSession.userId,
      );
      const access = await this.identityAccessService.resolvePermissions(
        previousSession.tenantId,
        previousSession.userId,
        role,
      );

      return {
        userId: previousSession.userId,
        tenantId: previousSession.tenantId,
        role: access.role,
        sessionId: previousSession.id,
        permissionsVersion: 1,
        permissions: access.permissions,
      };
    });
  }

  async logout(refreshToken: string) {
    await this.internalSessionService.revokeSessionByRefreshToken(refreshToken);
    return { revoked: true };
  }

  async getUiProfile(userId: string, tenantId: string) {
    const [user] = await this.prisma.$queryRaw<
      Array<{
        id: string;
        display_name: string;
        locale: string;
        timezone: string;
        accessibility_overrides_json: Record<string, unknown> | null;
      }>
    >(Prisma.sql`
      SELECT
        id,
        display_name,
        locale,
        timezone,
        accessibility_overrides_json
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user.id,
      tenantId,
      displayName: user.display_name,
      locale: user.locale,
      timezone: user.timezone,
      accessibilityOverrides: user.accessibility_overrides_json ?? {},
    };
  }

  async updateUiProfile(
    userId: string,
    tenantId: string,
    actorRoleCode: string,
    dto: UpdateUiProfileDto,
  ) {
    const [existing] = await this.prisma.$queryRaw<
      Array<{
        id: string;
        display_name: string;
        locale: string;
        timezone: string;
        accessibility_overrides_json: Record<string, unknown> | null;
      }>
    >(Prisma.sql`
      SELECT
        id,
        display_name,
        locale,
        timezone,
        accessibility_overrides_json
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `);

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const mergedOverrides = {
      ...(existing.accessibility_overrides_json ?? {}),
      ...(dto.accessibilityOverrides ?? {}),
    };

    const [updated] = await this.prisma.$queryRaw<
      Array<{
        id: string;
        display_name: string;
        locale: string;
        timezone: string;
        accessibility_overrides_json: Record<string, unknown> | null;
      }>
    >(Prisma.sql`
      UPDATE users
      SET
        locale = ${dto.locale ?? existing.locale},
        timezone = ${dto.timezone ?? existing.timezone},
        accessibility_overrides_json = ${JSON.stringify(mergedOverrides)}::jsonb,
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING
        id,
        display_name,
        locale,
        timezone,
        accessibility_overrides_json
    `);

    await this.auditService.record({
      tenantId,
      actorUserId: userId,
      actorRoleCode,
      eventCode: 'user.ui_profile.update',
      entityType: 'user_profile',
      entityId: userId,
      resultCode: 'success',
      beforeStateJson: {
        locale: existing.locale,
        timezone: existing.timezone,
        accessibilityOverrides:
          existing.accessibility_overrides_json ?? {},
      },
      afterStateJson: {
        locale: updated.locale,
        timezone: updated.timezone,
        accessibilityOverrides: updated.accessibility_overrides_json ?? {},
      },
    });

    return {
      userId: updated.id,
      tenantId,
      displayName: updated.display_name,
      locale: updated.locale,
      timezone: updated.timezone,
      accessibilityOverrides: updated.accessibility_overrides_json ?? {},
    };
  }
}
