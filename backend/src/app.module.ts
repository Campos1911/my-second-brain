import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FinanceModule } from './finance/finance.module';
import { CategoriesModule } from './categories/categories.module';
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module'; // Importação adicionada

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
    WorkoutPlansModule, // Registro adicionado
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
