import { Module } from '@nestjs/common';
import { RoleService } from './role.service';

@Module({
  exports:[RoleService],
  providers: [RoleService],
})
export class RoleModule {}
