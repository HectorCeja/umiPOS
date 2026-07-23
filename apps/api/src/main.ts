import 'reflect-metadata';

import type { IncomingMessage } from 'node:http';

import { parseServerEnvironment, resolveTrustedWebOrigins } from '@nexo/config';
import fastifyCookie from '@fastify/cookie';
import openApiDocument from '@nexo/contracts/openapi' with { type: 'json' };
import { startTelemetry } from '@nexo/observability';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { ProblemDetailsFilter } from './core/problem-details.filter.js';
import { validateRequestOrigin } from './core/request-origin.js';
import { resolveRequestId } from './core/request-id.js';
import { markApplicationShuttingDown } from './health/health.controller.js';

const environment = parseServerEnvironment(process.env);
const telemetry = startTelemetry({
  enabled: !environment.OTEL_SDK_DISABLED,
  endpoint: environment.OTEL_EXPORTER_OTLP_ENDPOINT,
  serviceName: environment.OTEL_SERVICE_NAME,
  serviceVersion: process.env.npm_package_version ?? '0.0.0',
});

const adapter = new FastifyAdapter({
  bodyLimit: 1_048_576,
  genReqId: (request: IncomingMessage) => resolveRequestId(request.headers['x-request-id']),
  maxParamLength: 512,
  trustProxy: false,
});
const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
  bufferLogs: true,
});

await app.register(fastifyCookie);
const trustedWebOrigins = resolveTrustedWebOrigins(environment);
app
  .getHttpAdapter()
  .getInstance()
  .addHook('onRequest', async (request, response) => {
    void response.header('x-request-id', request.id);
    void response.header('cache-control', 'no-store');
    void response.header('x-content-type-options', 'nosniff');
    void response.header('referrer-policy', 'no-referrer');
    void response.header('permissions-policy', 'camera=(), microphone=(), geolocation=()');
    if (validateRequestOrigin(request, trustedWebOrigins) === 'rejected') {
      await response.code(403).send({
        status: 403,
        title: 'Request origin is not allowed',
        type: 'https://nexo.local/problems/origin-not-allowed',
      });
    }
  });
app.enableCors({
  credentials: true,
  allowedHeaders: ['content-type', 'idempotency-key', 'if-match', 'x-csrf-token', 'x-request-id'],
  exposedHeaders: ['etag', 'location', 'x-request-id'],
  methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  origin(origin, callback) {
    if (!origin || trustedWebOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    if (environment.LOCAL_DEVELOPMENT) {
      process.stderr.write(`[cors] rejected origin ${JSON.stringify(origin)}\n`);
    }
    callback(null, false);
  },
});

app.useLogger(app.get(Logger));
app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
app.useGlobalPipes(
  new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true }),
);
app.useGlobalFilters(new ProblemDetailsFilter());

SwaggerModule.setup('/api/docs', app, openApiDocument as unknown as OpenAPIObject, {
  jsonDocumentUrl: '/api/openapi.json',
});

await app.listen({ host: environment.API_HOST, port: environment.API_PORT });

if (environment.LOCAL_DEVELOPMENT) {
  const lan = environment.DEV_LAN_HOST;
  process.stdout.write(
    [
      '[network] NEXO development origins',
      `  Web local: http://localhost:${String(environment.DEV_WEB_PORT)}`,
      `  API local: http://localhost:${String(environment.DEV_API_PORT)}`,
      ...(lan
        ? [
            `  Web LAN: http://${lan}:${String(environment.DEV_WEB_PORT)}`,
            `  API LAN: http://${lan}:${String(environment.DEV_API_PORT)}`,
            `  Object storage LAN: http://${lan}:${String(environment.DEV_OBJECT_STORAGE_PORT)}`,
          ]
        : []),
    ].join('\n') + '\n',
  );
}

let shutdownStarted = false;
const shutdown = async () => {
  if (shutdownStarted) return;
  shutdownStarted = true;
  markApplicationShuttingDown();
  try {
    await app.close();
    await Promise.race([
      telemetry.shutdown(),
      new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 5_000);
        timer.unref();
      }),
    ]);
    process.exitCode = 0;
  } catch {
    process.exitCode = 1;
  } finally {
    process.exit();
  }
};
process.once('SIGTERM', () => void shutdown());
process.once('SIGINT', () => void shutdown());
