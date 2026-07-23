import type { DatabaseClient } from '@nexo/database';
import {
  Controller,
  Get,
  Header,
  Inject,
  ServiceUnavailableException,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import type { Redis } from 'ioredis';
import type { Client as MinioClient } from 'minio';

import { DATABASE, OBJECT_STORAGE, REDIS } from '../infrastructure/infrastructure.module.js';

interface ReadinessChecks {
  readonly database: 'up' | 'down';
  readonly objectStorage: 'up' | 'down';
  readonly redis: 'up' | 'down';
}

const dependencyTimeoutMs = 3_000;
let shuttingDown = false;

export function markApplicationShuttingDown() {
  shuttingDown = true;
}

function withTimeout<T>(operation: Promise<T>): Promise<T> {
  return Promise.race([
    operation,
    new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('DEPENDENCY_HEALTH_TIMEOUT'));
      }, dependencyTimeoutMs);
      timer.unref();
    }),
  ]);
}

function readinessStatus(result: PromiseSettledResult<unknown>): 'up' | 'down' {
  return result.status === 'fulfilled' ? 'up' : 'down';
}

@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    @Inject(DATABASE) private readonly database: DatabaseClient,
    @Inject(REDIS) private readonly redis: Redis,
    @Inject(OBJECT_STORAGE) private readonly objectStorage: MinioClient,
  ) {}

  @Get('live')
  @Header('Cache-Control', 'no-store')
  live() {
    return { status: 'ok' } as const;
  }

  @Get('ready')
  @Header('Cache-Control', 'no-store')
  async ready() {
    if (shuttingDown) {
      throw new ServiceUnavailableException({ status: 'error', reason: 'shutting_down' });
    }
    const checks = await Promise.allSettled([
      withTimeout(this.database.$queryRaw`SELECT 1`),
      withTimeout(this.ensureRedisConnection()),
      withTimeout(this.objectStorage.listBuckets()),
    ]);
    const result: ReadinessChecks = {
      database: readinessStatus(checks[0]),
      redis: readinessStatus(checks[1]),
      objectStorage: readinessStatus(checks[2]),
    };

    if (checks.slice(0, 2).some((check) => check.status === 'rejected')) {
      throw new ServiceUnavailableException({ status: 'error', checks: result });
    }
    return {
      status: result.objectStorage === 'down' ? ('degraded' as const) : ('ok' as const),
      checks: result,
    };
  }

  private async ensureRedisConnection(): Promise<string> {
    if (this.redis.status === 'wait') await this.redis.connect();
    return this.redis.ping();
  }
}
