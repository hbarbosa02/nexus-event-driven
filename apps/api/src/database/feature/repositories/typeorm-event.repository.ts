import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmBaseRepository } from './typeorm-base.repository';
import { EventRepository } from '@/event/data-access/repositories/event.repository';
import { EventEntity, EventStatus } from '@/database/feature/entities/event.entity';

@Injectable()
export class TypeOrmEventRepository 
  extends TypeOrmBaseRepository<EventEntity> 
  implements EventRepository {

  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, EventEntity);
  }

  async findByStatus(status: EventStatus): Promise<EventEntity[]> {
    return this.repository.find({ where: { status } });
  }

  async findPendingEvents(): Promise<EventEntity[]> {
    return this.repository.find({ where: { status: EventStatus.PENDING } });
  }

  async findFailedEvents(): Promise<EventEntity[]> {
    return this.repository.find({ where: { status: EventStatus.ERROR } });
  }

  async findByRetryCount(maxRetryCount: number): Promise<EventEntity[]> {
    return this.repository
      .createQueryBuilder('event')
      .where('event.retryCount >= :maxRetryCount', { maxRetryCount })
      .getMany();
  }
}
