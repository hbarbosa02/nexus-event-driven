import { Injectable } from '@nestjs/common';
import { ExampleRepository } from '@/example/data-access/repositories/example.repository';
import { left, right } from '@/shared/util/types/either';
import { Criteria } from '@/shared/util/types/criteria';
import { ResourceNotFoundError, ResourceAlreadyExistsError, Resources } from '@/shared/data-access/services/errors';
import {
  CreateExampleRequest,
  UpdateExampleRequest,
  CreateExampleResponse,
  UpdateExampleResponse,
  DeleteExampleResponse,
  FindExampleResponse,
  FindExamplesResponse,
} from '@/example/util/types/example.type';

@Injectable()
export class ExampleService {
  constructor(private readonly exampleRepository: ExampleRepository) {}

  async create(data: CreateExampleRequest): Promise<CreateExampleResponse> {
    try {
      // Verificar se já existe um exemplo com o mesmo nome
      const existingExample = await this.exampleRepository.findByName(data.name);
      if (existingExample) {
        return left(new ResourceAlreadyExistsError(Resources.Example));
      }

      const example = this.exampleRepository.create({
        name: data.name,
        description: data.description || null,
        active: data.active !== undefined ? data.active : true,
      });

      const savedExample = await this.exampleRepository.save(example);
      return right(savedExample);
    } catch (error) {
      return left(new Error(`Failed to create example: ${error.message}`));
    }
  }

  async findManyByCriteria(criteria: Criteria): Promise<FindExamplesResponse> {
    try {
      const result = await this.exampleRepository.findManyByCriteria(criteria);
      return right(result);
    } catch (error) {
      return left(new Error(`Failed to fetch examples: ${error.message}`));
    }
  }

  async findById(id: string): Promise<FindExampleResponse> {
    try {
      const example = await this.exampleRepository.findById(id);
      if (!example) {
        return left(new ResourceNotFoundError(Resources.Example));
      }
      return right(example);
    } catch (error) {
      return left(new Error(`Failed to find example: ${error.message}`));
    }
  }

  async update(id: string, data: UpdateExampleRequest): Promise<UpdateExampleResponse> {
    try {
      const example = await this.exampleRepository.findById(id);
      if (!example) {
        return left(new ResourceNotFoundError(Resources.Example));
      }

      // Se o nome está sendo alterado, verificar se já existe outro exemplo com o mesmo nome
      if (data.name && data.name !== example.name) {
        const existingExample = await this.exampleRepository.findByName(data.name);
        if (existingExample && existingExample.id !== id) {
          return left(new ResourceAlreadyExistsError(Resources.Example));
        }
      }

      const updatedExample = await this.exampleRepository.save({
        ...example,
        ...data,
      });

      return right(updatedExample);
    } catch (error) {
      return left(new Error(`Failed to update example: ${error.message}`));
    }
  }

  async delete(id: string): Promise<DeleteExampleResponse> {
    try {
      const example = await this.exampleRepository.findById(id);
      if (!example) {
        return left(new ResourceNotFoundError(Resources.Example));
      }

      await this.exampleRepository.delete(example);
      return right(undefined);
    } catch (error) {
      return left(new Error(`Failed to delete example: ${error.message}`));
    }
  }

  async findActiveExamples(): Promise<FindExamplesResponse> {
    try {
      const examples = await this.exampleRepository.findActiveExamples();
      return right({
        data: examples,
        pagination: {
          total: examples.length,
          page: 1,
          limit: examples.length,
          totalPages: 1,
        },
      });
    } catch (error) {
      return left(new Error(`Failed to fetch active examples: ${error.message}`));
    }
  }
}
