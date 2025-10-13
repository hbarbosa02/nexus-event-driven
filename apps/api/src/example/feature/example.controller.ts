import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ExampleService } from '@/example/data-access/services/example.service';
import { BaseController } from '@/shared/feature/base.controller';
import { ZodValidationPipe } from '@/shared/util/pipes/zod-validation.pipe';
import {
  createExampleSchema,
  updateExampleSchema,
  exampleQuerySchema,
  CreateExampleBodySchema,
  UpdateExampleBodySchema,
  ExampleQuerySchema,
} from '@/example/feature/schemas/example.schema';
import { PaginatedResult } from '@/shared/util/types/paginated-result';
import { ExampleEntity } from '@/database/feature/entities/example.entity';
import { ResourceNotFoundError, ResourceAlreadyExistsError } from '@/shared/data-access/services/errors';
import { CreateExampleRequest } from '../util/types/example.type';

@Controller('examples')
export class ExampleController extends BaseController<ExampleQuerySchema> {
  constructor(private readonly exampleService: ExampleService) {
    super();
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findExamples(@Query() query: ExampleQuerySchema): Promise<PaginatedResult<ExampleEntity>> {
    const criteria = this.parseQueryParamsToCriteria(query);
    const result = await this.exampleService.findManyByCriteria(criteria);
    
    if (result.isLeft()) {
      const error = result.value;
      throw new BadRequestException(error.message);
    }

    return result.isRight() ? result.value : { data: [], pagination: { total: 0, page: 0, limit: 0, totalPages: 0 } };
  }

  @Get('active')
  @UseInterceptors(ClassSerializerInterceptor)
  async findActiveExamples(): Promise<PaginatedResult<ExampleEntity>> {
    const result = await this.exampleService.findActiveExamples();
    
    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    return result.isRight() ? result.value : { data: [], pagination: { total: 0, page: 0, limit: 0, totalPages: 0 } };
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findExampleById(@Param('id') id: string): Promise<ExampleEntity> {
    const result = await this.exampleService.findById(id);
    
    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.isRight() ? result.value : null;
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createExampleSchema))
  @UseInterceptors(ClassSerializerInterceptor)
  async createExample(@Body() data: CreateExampleBodySchema): Promise<boolean> {
    const result = await this.exampleService.create(data as CreateExampleRequest);
    
    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceAlreadyExistsError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.isRight();
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(updateExampleSchema))
  @UseInterceptors(ClassSerializerInterceptor)
  async updateExample(
    @Param('id') id: string,
    @Body() data: UpdateExampleBodySchema
  ): Promise<boolean> {
    const result = await this.exampleService.update(id, data);
    
    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case ResourceAlreadyExistsError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.isRight();
  }

  @Delete(':id')
  async deleteExample(@Param('id') id: string): Promise<{ message: string }> {
    const result = await this.exampleService.delete(id);
    
    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return { message: 'Example deleted successfully' };
  }
}
