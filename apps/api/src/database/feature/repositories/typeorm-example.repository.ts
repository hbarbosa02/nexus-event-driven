import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmBaseRepository } from './typeorm-base.repository';
import { ExampleRepository } from '@/example/data-access/repositories/example.repository';
import { ExampleEntity } from '@/database/feature/entities/example.entity';

@Injectable()
export class TypeOrmExampleRepository 
  extends TypeOrmBaseRepository<ExampleEntity> 
  implements ExampleRepository {

  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, ExampleEntity);
  }

  async findActiveExamples(): Promise<ExampleEntity[]> {
    return this.repository.find({ where: { active: true } });
  }

  async findByName(name: string): Promise<ExampleEntity | null> {
    return this.repository.findOne({ where: { name } });
  }
}
