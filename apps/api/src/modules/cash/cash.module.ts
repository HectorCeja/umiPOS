import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module.js';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { CASH_REPOSITORY } from './application/cash.ports.js';
import { CashService } from './application/cash.service.js';
import { PrismaCashRepository } from './infrastructure/prisma-cash.repository.js';
import { CashController } from './interface/cash.controller.js';
@Module({
  imports: [InfrastructureModule, AuthenticationModule, AuthorizationModule],
  controllers: [CashController],
  providers: [CashService, { provide: CASH_REPOSITORY, useClass: PrismaCashRepository }],
})
export class CashModule {}
