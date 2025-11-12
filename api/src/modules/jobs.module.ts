import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MaterializedViewRefreshService } from 'src/services/materialized-view-refresh.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [MaterializedViewRefreshService],
})
export class JobsModule {}
