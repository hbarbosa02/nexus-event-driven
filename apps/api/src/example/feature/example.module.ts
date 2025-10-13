import { Module } from '@nestjs/common';
import { ExampleController } from './example.controller';
import { ExampleService } from '@/example/data-access/services/example.service';
import { ExampleRepository } from '@/example/data-access/repositories/example.repository';

@Module({
  controllers: [ExampleController],
  providers: [ExampleService],
  exports: [ExampleService],
})
export class ExampleModule {}
