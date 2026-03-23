import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseIdentityService {
  private readonly app: App | null;
  private readonly mockUsers: Record<string, Record<string, string>>;

  constructor(private readonly configService: ConfigService) {
    const mockUsersJson =
      this.configService.get<string>('firebase.mockUsersJson') ?? '';
    this.mockUsers = mockUsersJson
      ? (JSON.parse(mockUsersJson) as Record<string, Record<string, string>>)
      : {};

    if (Object.keys(this.mockUsers).length > 0) {
      this.app = null;
      return;
    }

    const projectId = this.configService.get<string>('firebase.projectId');
    const clientEmail = this.configService.get<string>('firebase.clientEmail');
    const privateKey = this.configService.get<string>('firebase.privateKey');

    if (!projectId || !clientEmail || !privateKey) {
      this.app = null;
      return;
    }

    this.app =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
  }

  async verifyIdToken(idToken: string) {
    if (this.mockUsers[idToken]) {
      return this.mockUsers[idToken];
    }

    if (!this.app) {
      throw new UnauthorizedException(
        'Firebase credentials are not configured in the backend',
      );
    }

    return getAuth(this.app).verifyIdToken(idToken, true);
  }
}
