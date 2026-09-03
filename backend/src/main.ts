import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 4000);
  const apiPrefix = configService.get<string>('apiPrefix', 'api/v1');
  const corsOrigin = configService.get<string>('corsOrigin', 'http://localhost:3000');

  // Security: Restrict CORS to authorized frontend origin
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global Prefix for all REST API endpoints
  app.setGlobalPrefix(apiPrefix);

  // Global Input Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Request Logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`=======================================================`);
  logger.log(`TONI&GUY AI Customer Concierge Backend Active`);
  logger.log(`Port:           ${port}`);
  logger.log(`API Prefix:     /${apiPrefix}`);
  logger.log(`CORS Origin:    ${corsOrigin}`);
  logger.log(`Health Check:   http://localhost:${port}/${apiPrefix}/health`);
  logger.log(`=======================================================`);
}

bootstrap();
