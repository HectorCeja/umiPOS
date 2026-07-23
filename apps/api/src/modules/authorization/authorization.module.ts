import { Module } from '@nestjs/common';

import { InfrastructureModule } from '../../infrastructure/infrastructure.module.js';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AUTHORIZATION_REPOSITORY } from './application/authorization.ports.js';
import { AuthorizationService } from './application/authorization.service.js';
import { PrismaAuthorizationRepository } from './infrastructure/prisma-authorization.repository.js';
import { AuthorizationController } from './interface/authorization.controller.js';

@Module({
  imports: [InfrastructureModule, AuthenticationModule],
  controllers: [AuthorizationController],
  providers: [
    { provide: AUTHORIZATION_REPOSITORY, useClass: PrismaAuthorizationRepository },
    AuthorizationService,
  ],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
