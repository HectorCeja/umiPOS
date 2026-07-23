import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module.js';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { DeviceService } from './application/device.service.js';
import { DeviceController } from './interface/device.controller.js';

@Module({
  imports: [InfrastructureModule, AuthenticationModule, AuthorizationModule],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
