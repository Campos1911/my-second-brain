import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule'; // Importação do agendador
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FinanceModule } from './finance/finance.module';
import { CategoriesModule } from './categories/categories.module';
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module'; // Novo Módulo

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(), // Inicialização do motor de agendamentos
    PrismaModule,
    UsersModule,
    AuthModule,
    FinanceModule,
    CategoriesModule,
    RecurringTransactionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
