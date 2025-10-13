import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from '@/database/util/typeorm/naming-strategy';
import { EventEntity, ExampleEntity } from '@/database/feature/entities';
import { TypeOrmEventRepository } from './repositories/typeorm-event.repository';
import { TypeOrmExampleRepository } from './repositories/typeorm-example.repository';
import { EventRepository } from '@/event/data-access/repositories/event.repository';
import { ExampleRepository } from '@/example/data-access/repositories/example.repository';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [EventEntity, ExampleEntity],
        synchronize: configService.get('DATABASE_SYNCHRONIZE'),
        logging: configService.get('DATABASE_LOGGING'),
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([EventEntity, ExampleEntity]),
  ],
  providers: [
    {
      provide: EventRepository,
      useClass: TypeOrmEventRepository,
    },
    {
      provide: ExampleRepository,
      useClass: TypeOrmExampleRepository,
    },
  ],
  exports: [EventRepository, ExampleRepository],
})
export class DatabaseModule {}
