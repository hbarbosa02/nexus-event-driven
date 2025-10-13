import { Either } from '@/shared/util/types/either';
import { ExampleEntity } from '@/database/feature/entities/example.entity';
import { PaginatedResult } from '@/shared/util/types/paginated-result';

export interface CreateExampleRequest {
  name: string;
  description?: string;
  active?: boolean;
}

export interface UpdateExampleRequest {
  name?: string;
  description?: string;
  active?: boolean;
}

export type CreateExampleResponse = Either<Error, ExampleEntity>;
export type UpdateExampleResponse = Either<Error, ExampleEntity>;
export type DeleteExampleResponse = Either<Error, void>;
export type FindExampleResponse = Either<Error, ExampleEntity>;
export type FindExamplesResponse = Either<Error, PaginatedResult<ExampleEntity>>;
