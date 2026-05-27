import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FinanceModule } from './finance/finance.module';
import { CategoriesModule } from './categories/categories.module';
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';
import { WorkoutSessionsModule } from './workout-sessions/workout-sessions.module'; // Importação adicionada
import { ExercisesModule } from './exercises/exercises.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
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
  providers: [],
})
export class AppModule {}
