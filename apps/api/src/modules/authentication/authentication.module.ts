import { authenticationConfigurationFromEnvironment, parseServerEnvironment } from '@nexo/config';
import { Module } from '@nestjs/common';

import { InfrastructureModule } from '../../infrastructure/infrastructure.module.js';
import {
  ABUSE_PROTECTION,
  AUTHENTICATION_CONFIGURATION,
  AUTHENTICATION_REPOSITORY,
  COMPROMISED_PASSWORDS,
} from './application/authentication.ports.js';
import { AuthenticationService } from './application/authentication.service.js';
import { PrismaAuthenticationRepository } from './infrastructure/prisma-authentication.repository.js';
import { RedisAbuseProtection } from './infrastructure/redis-abuse-protection.js';
import { FilePasswordBlocklist } from './infrastructure/file-password-blocklist.js';
import { AuthenticationController } from './interface/authentication.controller.js';

@Module({
  imports: [InfrastructureModule],
  controllers: [AuthenticationController],
  providers: [
    {
      provide: AUTHENTICATION_CONFIGURATION,
      useFactory: () =>
        authenticationConfigurationFromEnvironment(parseServerEnvironment(process.env)),
    },
    { provide: AUTHENTICATION_REPOSITORY, useClass: PrismaAuthenticationRepository },
    { provide: ABUSE_PROTECTION, useClass: RedisAbuseProtection },
    { provide: COMPROMISED_PASSWORDS, useClass: FilePasswordBlocklist },
    AuthenticationService,
  ],
  exports: [AuthenticationService, AUTHENTICATION_CONFIGURATION],
})
export class AuthenticationModule {}
