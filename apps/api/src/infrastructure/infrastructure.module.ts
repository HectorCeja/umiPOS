import { createDatabaseClient } from '@nexo/database';
import { Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Client as MinioClient } from 'minio';
import nodemailer from 'nodemailer';

export const DATABASE = Symbol('DATABASE');
export const REDIS = Symbol('REDIS');
export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE');
export const MAILER = Symbol('MAILER');

export interface MailerPort {
  send(message: Readonly<{ to: string; subject: string; text: string }>): Promise<void>;
}

@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: () => createDatabaseClient(process.env.DATABASE_URL ?? ''),
    },
    {
      provide: REDIS,
      useFactory: () =>
        new Redis(process.env.REDIS_URL ?? '', {
          commandTimeout: 3_000,
          connectTimeout: 2_000,
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          retryStrategy: (attempt) => Math.min(attempt * 100, 1_000),
        }),
    },
    {
      provide: OBJECT_STORAGE,
      useFactory: () => {
        const endpoint = new URL(process.env.S3_ENDPOINT ?? 'http://localhost:9000');
        return new MinioClient({
          endPoint: endpoint.hostname,
          port: Number(endpoint.port || (endpoint.protocol === 'https:' ? 443 : 80)),
          useSSL: endpoint.protocol === 'https:',
          accessKey: process.env.S3_ACCESS_KEY ?? '',
          secretKey: process.env.S3_SECRET_KEY ?? '',
          region: process.env.S3_REGION ?? 'us-east-1',
        });
      },
    },
    {
      provide: MAILER,
      useFactory: (): MailerPort => {
        const transport = nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: Number(process.env.MAIL_PORT ?? 1025),
          secure: false,
        });
        return {
          send: async (message) => {
            await transport.sendMail({ from: process.env.MAIL_FROM, ...message });
          },
        };
      },
    },
  ],
  exports: [DATABASE, REDIS, OBJECT_STORAGE, MAILER],
})
export class InfrastructureModule {}
