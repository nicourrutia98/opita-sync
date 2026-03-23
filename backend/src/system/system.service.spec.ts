import { ConfigService } from '@nestjs/config';
import { SystemService } from './system.service';

describe('SystemService', () => {
  let service: SystemService;

  beforeEach(() => {
    service = new SystemService(
      new ConfigService({
        app: { nodeEnv: 'test' },
        database: { url: 'postgres://example' },
        jwt: { accessSecret: 'x'.repeat(32) },
        firebase: { projectId: 'demo-project' },
      }),
    );
  });

  it('returns health payload', () => {
    const result = service.getHealth();

    expect(result.status).toBe('ok');
    expect(result.environment).toBe('test');
  });

  it('reports ready when core config is present', () => {
    const result = service.getReadiness();

    expect(result.status).toBe('ready');
    expect(result.checks.databaseUrlConfigured).toBe(true);
    expect(result.checks.jwtSecretConfigured).toBe(true);
    expect(result.checks.firebaseProjectConfigured).toBe(true);
  });
});
