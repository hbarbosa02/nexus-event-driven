import { BaseRepository } from '@/shared/data-access/repositories/base.repository';
import { ExampleEntity } from '@/database/feature/entities/example.entity';

export abstract class ExampleRepository extends BaseRepository<ExampleEntity> {
  abstract findActiveExamples(): Promise<ExampleEntity[]>;
  abstract findByName(name: string): Promise<ExampleEntity | null>;
}
