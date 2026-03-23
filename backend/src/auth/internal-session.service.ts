import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { SessionStatus } from '@prisma/client';
import { PrismaService } from '../common/database/prisma.service';
import type { SessionPrincipal } from '../common/interfaces/session-principal.interface';

@Injectable()
export class InternalSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashToken(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  async issueSession(payload: Omit<SessionPrincipal, 'sub' | 'iat' | 'exp'>) {
    const refreshToken = randomBytes(48).toString('hex');
    const refreshTokenHash = this.hashToken(refreshToken);
    const refreshTtlSeconds = this.configService.getOrThrow<number>(
      'jwt.refreshTtlSeconds',
    );
    const accessTtlSeconds = this.configService.getOrThrow<number>(
      'jwt.accessTtlSeconds',
    );
    const maxSessionsPerUser = this.configService.getOrThrow<number>(
      'jwt.maxSessionsPerUser',
    );

    const session = await this.prisma.session.create({
      data: {
        tenantId: payload.tenantId,
        userId: payload.userId,
        refreshTokenHash,
        expiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
      },
    });

    const activeSessions = await this.prisma.session.findMany({
      where: {
        userId: payload.userId,
        status: SessionStatus.ACTIVE,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (activeSessions.length > maxSessionsPerUser) {
      const sessionsToRevoke = activeSessions.slice(0, activeSessions.length - maxSessionsPerUser);
      await this.prisma.session.updateMany({
        where: {
          id: { in: sessionsToRevoke.map((entry) => entry.id) },
        },
        data: {
          status: SessionStatus.REVOKED,
        },
      });
    }

    const principal: SessionPrincipal = {
      sub: payload.userId,
      userId: payload.userId,
      tenantId: payload.tenantId,
      role: payload.role,
      sessionId: session.id,
      permissionsVersion: payload.permissionsVersion,
      permissions: payload.permissions,
    };

    const accessToken = await this.jwtService.signAsync(principal, {
      secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
      expiresIn: accessTtlSeconds,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTtlSeconds,
      sessionId: session.id,
    };
  }

  async refreshSession(refreshToken: string, permissionsResolver: (sessionId: string) => Promise<Omit<SessionPrincipal, 'sub' | 'iat' | 'exp'>>) {
    const session = await this.prisma.session.findFirst({
      where: {
        refreshTokenHash: this.hashToken(refreshToken),
        status: SessionStatus.ACTIVE,
      },
    });

    if (!session || session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        status: SessionStatus.REVOKED,
      },
    });

    const principal = await permissionsResolver(session.id);
    return this.issueSession(principal);
  }

  async revokeSessionByRefreshToken(refreshToken: string) {
    const refreshTokenHash = this.hashToken(refreshToken);
    await this.prisma.session.updateMany({
      where: {
        refreshTokenHash,
      },
      data: {
        status: SessionStatus.REVOKED,
      },
    });
  }
}
