import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthResponseDto } from './dto/health-response.dto';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  check(): HealthResponseDto {
    const memory = process.memoryUsage();
    return {
      status: 'ok',
      service: 'toni-and-guy-backend',
      version: '0.1.0',
      environment: this.configService.get<string>('nodeEnv', 'development'),
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      memoryUsageMb: {
        rss: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
        heapTotal: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        heapUsed: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
      },
    };
  }
}
