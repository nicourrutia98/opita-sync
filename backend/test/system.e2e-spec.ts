import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { SystemModule } from '../src/system/system.module';

describe('System endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          isGlobal: true,
          load: [
            () => ({
              app: { nodeEnv: 'test' },
              database: { url: 'postgres://example' },
              jwt: { accessSecret: 'x'.repeat(32) },
              firebase: { projectId: 'demo-project' },
            }),
          ],
        }),
        SystemModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/health (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/api/health').expect(200);

    expect(response.body.status).toBe('ok');
  });

  it('/api/ready (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/api/ready').expect(200);

    expect(response.body.status).toBe('ready');
  });
});
