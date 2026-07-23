import { Inject, Injectable } from '@nestjs/common';
import type { Redis } from 'ioredis';

import { REDIS } from '../../../infrastructure/infrastructure.module.js';
import type { AbuseProtectionPort } from '../application/authentication.ports.js';

const ATOMIC_LIMIT_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return count
`;

@Injectable()
export class RedisAbuseProtection implements AbuseProtectionPort {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async consume(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const count = await this.redis.eval(ATOMIC_LIMIT_SCRIPT, 1, key, String(windowSeconds));
    return Number(count) <= limit;
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
