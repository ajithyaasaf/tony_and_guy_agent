import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('HealthCheck (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns HTTP 200 with ok status', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('toni-and-guy-backend');
    expect(response.body.version).toBe('0.1.0');
    expect(response.body.environment).toBeDefined();
    expect(typeof response.body.uptimeSeconds).toBe('number');
    expect(response.body.memoryUsageMb).toBeDefined();
    expect(response.body.memoryUsageMb.heapUsed).toBeGreaterThan(0);
  });

  it('GET /api/v1/non-existent-route returns HTTP 404', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/non-existent-route')
      .expect(404);
  });
});
