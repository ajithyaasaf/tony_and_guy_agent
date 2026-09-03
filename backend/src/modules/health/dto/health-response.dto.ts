export class HealthResponseDto {
  status!: 'ok' | 'degraded' | 'down';
  service!: string;
  version!: string;
  environment!: string;
  uptimeSeconds!: number;
  timestamp!: string;
  memoryUsageMb!: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
}
