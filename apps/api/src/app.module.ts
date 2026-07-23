import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import type { Options as PinoHttpOptions } from 'pino-http';

import { HealthModule } from './health/health.module.js';
import { InfrastructureModule } from './infrastructure/infrastructure.module.js';
import { AuthenticationModule } from './modules/authentication/authentication.module.js';
import { AuthorizationModule } from './modules/authorization/authorization.module.js';
import { ControlPlaneModule } from './modules/control-plane/control-plane.module.js';
import { ProductModule } from './modules/product/product.module.js';
import { InventoryModule } from './modules/inventory/inventory.module.js';
import { SalesModule } from './modules/sales/sales.module.js';
import { CashModule } from './modules/cash/cash.module.js';
import { DeviceModule } from './modules/device/device.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';

export const pinoHttpOptions = {
  autoLogging: true,
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-csrf-token"]',
      'req.headers["x-nexo-device-credential"]',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, singleLine: true },
        },
      }
    : {}),
} satisfies PinoHttpOptions;

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: pinoHttpOptions,
    }),
    InfrastructureModule,
    HealthModule,
    AuthenticationModule,
    AuthorizationModule,
    ControlPlaneModule,
    ProductModule,
    InventoryModule,
    SalesModule,
    CashModule,
    DeviceModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
