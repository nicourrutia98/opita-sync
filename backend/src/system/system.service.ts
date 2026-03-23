import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SystemService {
  constructor(private readonly configService: ConfigService) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('app.nodeEnv'),
    };
  }

  getReadiness() {
    const checks = {
      databaseUrlConfigured: Boolean(this.configService.get<string>('database.url')),
      jwtSecretConfigured: Boolean(this.configService.get<string>('jwt.accessSecret')),
      firebaseProjectConfigured: Boolean(
        this.configService.get<string>('firebase.projectId'),
      ),
    };

    return {
      status: Object.values(checks).every(Boolean) ? 'ready' : 'degraded',
      checks,
    };
  }
}
