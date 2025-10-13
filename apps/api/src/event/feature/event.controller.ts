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
import { EventService } from '@/event/data-access/services/event.service';
import { BaseController } from '@/shared/feature/base.controller';
import { ZodValidationPipe } from '@/shared/util/pipes/zod-validation.pipe';
import {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
  retryEventSchema,
  CreateEventBodySchema,
  UpdateEventBodySchema,
  EventQuerySchema,
  RetryEventBodySchema,
} from '@/event/feature/schemas/event.schema';
import { PaginatedResult } from '@/shared/util/types/paginated-result';
import { EventEntity } from '@/database/feature/entities/event.entity';
import { ResourceNotFoundError, ResourceAlreadyExistsError } from '@/shared/data-access/services/errors';
import { CreateEventRequest } from '../util/types/event.type';

@Controller('events')
export class EventController extends BaseController<EventQuerySchema> {
  constructor(private readonly eventService: EventService) {
    super();
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findEvents(@Query() query: EventQuerySchema): Promise<PaginatedResult<EventEntity>> {
    const criteria = this.parseQueryParamsToCriteria(query);
    const result = await this.eventService.findManyByCriteria(criteria);
    
    if (result.isLeft()) {
      const error = result.value;
      throw new BadRequestException(error.message);
    }

    return result.isRight() ? result.value : null;
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findEventById(@Param('id') id: string): Promise<EventEntity> {
    const result = await this.eventService.findById(id);
    
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
  @UsePipes(new ZodValidationPipe(createEventSchema))
  @UseInterceptors(ClassSerializerInterceptor)
  async createEvent(@Body() data: CreateEventBodySchema): Promise<EventEntity> {
    const result = await this.eventService.create(data as CreateEventRequest);
    
    if (result.isLeft()) {
      const error = result.value;
      throw new BadRequestException(error.message);
    }

    return result.isRight() ? result.value : null;
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(updateEventSchema))
  @UseInterceptors(ClassSerializerInterceptor)
  async updateEvent(
    @Param('id') id: string,
    @Body() data: UpdateEventBodySchema
  ): Promise<EventEntity> {
    const result = await this.eventService.update(id, data);
    
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

    return result.isRight() ? result.value : null;
  }

  @Delete(':id')
  async deleteEvent(@Param('id') id: string): Promise<{ message: string }> {
    const result = await this.eventService.delete(id);
    
    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return { message: 'Event deleted successfully' };
  }

  @Post(':id/retry')
  @UsePipes(new ZodValidationPipe(retryEventSchema))
  @UseInterceptors(ClassSerializerInterceptor)
  async retryEvent(
    @Param('id') id: string,
    @Body() data: RetryEventBodySchema
  ): Promise<EventEntity> {
    const result = await this.eventService.retry(id, data.maxRetries);
    
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
}
