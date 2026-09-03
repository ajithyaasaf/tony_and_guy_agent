import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import configuration from '../../config/configuration';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
      ],
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('check', () => {
    it('should return operational health status', () => {
      const result = controller.check();
      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('toni-and-guy-backend');
      expect(result.version).toBe('0.1.0');
      expect(typeof result.uptimeSeconds).toBe('number');
      expect(result.timestamp).toBeDefined();
      expect(result.memoryUsageMb).toBeDefined();
      expect(result.memoryUsageMb.heapUsed).toBeGreaterThan(0);
    });
  });
});
