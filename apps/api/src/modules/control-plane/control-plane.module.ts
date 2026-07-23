import { Module } from '@nestjs/common';

import { InfrastructureModule } from '../../infrastructure/infrastructure.module.js';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { CONTROL_PLANE_REPOSITORY } from './application/control-plane.ports.js';
import { ControlPlaneService } from './application/control-plane.service.js';
import { PrismaControlPlaneRepository } from './infrastructure/prisma-control-plane.repository.js';
import { ControlPlaneController } from './interface/control-plane.controller.js';

@Module({
  imports: [InfrastructureModule, AuthenticationModule, AuthorizationModule],
  controllers: [ControlPlaneController],
  providers: [
    ControlPlaneService,
    { provide: CONTROL_PLANE_REPOSITORY, useClass: PrismaControlPlaneRepository },
  ],
})
export class ControlPlaneModule {}
