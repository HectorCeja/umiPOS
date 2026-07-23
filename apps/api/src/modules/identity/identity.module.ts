import { Module } from '@nestjs/common';

import { InfrastructureModule } from '../../infrastructure/infrastructure.module.js';
import { IdentityService } from './application/identity.service.js';
import { IdentityController } from './interface/identity.controller.js';

@Module({
  imports: [InfrastructureModule],
  controllers: [IdentityController],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
