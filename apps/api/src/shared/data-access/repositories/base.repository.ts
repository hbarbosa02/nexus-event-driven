import { Either, left, right } from '@/shared/util/types/either';
import { Criteria } from '@/shared/util/types/criteria';
import { PaginatedResult } from '@/shared/util/types/paginated-result';

export abstract class BaseRepository<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract findOne(params: Partial<T>): Promise<T | null>;
  abstract findBy(params: Partial<T>): Promise<T[]>;
  abstract findManyByCriteria(criteria: Criteria): Promise<PaginatedResult<T>>;
  abstract findMany(params?: Partial<T>): Promise<T[]>;
  abstract findAll(): Promise<T[]>;
  abstract create(entity: Partial<T>): T;
  abstract save(entity: T): Promise<T>;
  abstract saveMany(entities: T[]): Promise<T[]>;
  abstract delete(entity: T): Promise<void>;
  abstract count(): Promise<number>;
}
