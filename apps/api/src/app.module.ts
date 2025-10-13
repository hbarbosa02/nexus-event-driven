import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/database/feature/database.module';
import { EventModule } from '@/event/feature/event.module';
import { ExampleModule } from '@/example/feature/example.module';
import { HealthController } from '@/health.controller';
import { validateEnv } from '@/env/env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    EventModule,
    ExampleModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
