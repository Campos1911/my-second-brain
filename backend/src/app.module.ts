import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FinanceModule } from './finance/finance.module';
import { CategoriesModule } from './categories/categories.module';
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';
import { WorkoutSessionsModule } from './workout-sessions/workout-sessions.module';
import { ExercisesModule } from './exercises/exercises.module';
import { TasksModule } from './tasks/tasks.module';
import { validate } from './common/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ScheduleModule.forRoot(),
    // Limitação de taxa de requisições global: Padrão de 60 requisições a cada 1 minuto (60.000 ms) por IP.
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    FinanceModule,
    CategoriesModule,
    RecurringTransactionsModule,
    WorkoutPlansModule,
    WorkoutSessionsModule,
    ExercisesModule,
    TasksModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
