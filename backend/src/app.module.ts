import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { HealthModule } from './modules/health/health.module';
import { OutletsModule } from './modules/outlets/outlets.module';
import { ServicesModule } from './modules/services/services.module';
import { OffersModule } from './modules/offers/offers.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ConsultationsModule } from './modules/consultations/consultations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    HealthModule,
    OutletsModule,
    ServicesModule,
    OffersModule,
    AvailabilityModule,
    BookingsModule,
    ConsultationsModule,
  ],
})
export class AppModule {}
