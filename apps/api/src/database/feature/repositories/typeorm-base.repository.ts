import { Repository, FindOptionsWhere, FindManyOptions, In, DeepPartial } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@/shared/data-access/repositories/base.repository';
import { PaginatedResult } from '@/shared/util/types/paginated-result';
import { Criteria } from '@/shared/util/types/criteria';
import { TypeOrmCriteriaConverter } from '@/database/util/typeorm/criteria-converter';

export abstract class TypeOrmBaseRepository<T> extends BaseRepository<T> {
  protected repository: Repository<T>;

  constructor(@InjectDataSource() dataSource: DataSource, entity: new () => T) {
    super();
    this.repository = dataSource.getRepository(entity);
  }

  async findById(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id } as unknown as FindOptionsWhere<T> });
  }

  async findOne(params: Partial<T>): Promise<T | null> {
    return this.repository.findOne({ where: params as FindOptionsWhere<T> });
  }

  async findBy(params: Partial<T>): Promise<T[]> {
    return this.repository.find({ where: params as FindOptionsWhere<T> });
  }

  async findManyByCriteria(criteria: Criteria): Promise<PaginatedResult<T>> {
    const converter = new TypeOrmCriteriaConverter();
    const findOptions = converter.convert(criteria);
    
    const [data, total] = await this.repository.findAndCount(findOptions);
    
    const totalPages = Math.ceil(total / criteria.pagination.take);
    const currentPage = Math.floor(criteria.pagination.skip / criteria.pagination.take) + 1;

    return {
      data,
      pagination: {
        total,
        page: currentPage,
        limit: criteria.pagination.take,
        totalPages,
      },
    };
  }

  async findMany(params?: Partial<T>): Promise<T[]> {
    return this.repository.find({ where: params as FindOptionsWhere<T> });
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  create(entity: Partial<T>): T {
    return this.repository.create(entity as DeepPartial<T>);
  }

  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async saveMany(entities: T[]): Promise<T[]> {
    return this.repository.save(entities);
  }

  async delete(entity: T): Promise<void> {
    await this.repository.remove(entity);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
}
