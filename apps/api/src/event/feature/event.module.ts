import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from '@/event/data-access/services/event.service';
import { EventRepository } from '@/event/data-access/repositories/event.repository';

@Module({
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
