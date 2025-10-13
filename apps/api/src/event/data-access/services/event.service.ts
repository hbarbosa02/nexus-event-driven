import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { EventRepository } from '@/event/data-access/repositories/event.repository';
import { EventStatus } from '@/database/feature/entities/event.entity';
import { left, right } from '@/shared/util/types/either';
import { Criteria } from '@/shared/util/types/criteria';
import { ResourceNotFoundError, Resources } from '@/shared/data-access/services/errors';
import {
  CreateEventRequest,
  UpdateEventRequest,
  CreateEventResponse,
  UpdateEventResponse,
  DeleteEventResponse,
  FindEventResponse,
  FindEventsResponse,
  RetryEventResponse,
} from '@/event/util/types/event.type';

@Injectable()
export class EventService {
  private eventEmitter = new EventEmitter();

  constructor(private readonly eventRepository: EventRepository) {}

  async create(data: CreateEventRequest): Promise<CreateEventResponse> {
    try {
      const event = this.eventRepository.create({
        name: data.name,
        data: data.data || null,
        status: EventStatus.PENDING,
        retryCount: 0,
        startTime: new Date(),
      });

      const savedEvent = await this.eventRepository.save(event);
      
      // Emitir o evento nativo do Node.js
      this.eventEmitter.emit(data.name, data.data);
      
      return right(savedEvent);
    } catch (error) {
      return left(new Error(`Failed to create event: ${error.message}`));
    }
  }

  async findManyByCriteria(criteria: Criteria): Promise<FindEventsResponse> {
    try {
      const result = await this.eventRepository.findManyByCriteria(criteria);
      return right(result);
    } catch (error) {
      return left(new Error(`Failed to fetch events: ${error.message}`));
    }
  }

  async findById(id: string): Promise<FindEventResponse> {
    try {
      const event = await this.eventRepository.findById(id);
      if (!event) {
        return left(new ResourceNotFoundError(Resources.Event));
      }
      return right(event);
    } catch (error) {
      return left(new Error(`Failed to find event: ${error.message}`));
    }
  }

  async update(id: string, data: UpdateEventRequest): Promise<UpdateEventResponse> {
    try {
      const event = await this.eventRepository.findById(id);
      if (!event) {
        return left(new ResourceNotFoundError(Resources.Event));
      }

      const updatedEvent = await this.eventRepository.save({
        ...event,
        ...data,
        endTime: data.status === EventStatus.SUCCESS || data.status === EventStatus.ERROR || data.status === EventStatus.CANCELLED 
          ? new Date() 
          : event.endTime,
      });

      return right(updatedEvent);
    } catch (error) {
      return left(new Error(`Failed to update event: ${error.message}`));
    }
  }

  async delete(id: string): Promise<DeleteEventResponse> {
    try {
      const event = await this.eventRepository.findById(id);
      if (!event) {
        return left(new ResourceNotFoundError(Resources.Event));
      }

      await this.eventRepository.delete(event);
      return right(undefined);
    } catch (error) {
      return left(new Error(`Failed to delete event: ${error.message}`));
    }
  }

  async retry(id: string, maxRetries: number = 5): Promise<RetryEventResponse> {
    try {
      const event = await this.eventRepository.findById(id);
      if (!event) {
        return left(new ResourceNotFoundError(Resources.Event));
      }

      if (event.status === EventStatus.SUCCESS) {
        return left(new Error('Cannot retry a successful event'));
      }

      if (event.status === EventStatus.CANCELLED) {
        return left(new Error('Cannot retry a cancelled event'));
      }

      if (event.retryCount >= maxRetries) {
        // Cancelar o evento após máximo de tentativas
        const cancelledEvent = await this.eventRepository.save({
          ...event,
          status: EventStatus.CANCELLED,
          cancellationReason: `Maximum retry attempts (${maxRetries}) exceeded`,
          endTime: new Date(),
        });
        return left(new Error(`Event cancelled after ${maxRetries} retry attempts`));
      }

      // Incrementar contador de retry e tentar novamente
      const updatedEvent = await this.eventRepository.save({
        ...event,
        retryCount: event.retryCount + 1,
        status: EventStatus.PENDING,
        startTime: new Date(),
        endTime: null,
        error: null,
      });

      // Emitir o evento novamente
      this.eventEmitter.emit(event.name, event.data);

      return right(updatedEvent);
    } catch (error) {
      return left(new Error(`Failed to retry event: ${error.message}`));
    }
  }

  async executeEvent(name: string, data?: any): Promise<void> {
    this.eventEmitter.emit(name, data);
  }

  async getEventEmitter(): Promise<EventEmitter> {
    return this.eventEmitter;
  }
}
