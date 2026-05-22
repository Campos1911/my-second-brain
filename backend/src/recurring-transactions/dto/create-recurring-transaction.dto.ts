import {
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import {
  RecurrenceFrequency,
  PaymentMethod,
} from '../../generated/prisma/client';

export class CreateRecurringTransactionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  amount!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(RecurrenceFrequency, {
    message:
      'Frequência inválida. Valores aceitos: DAILY, WEEKLY, BIWEEKLY, MONTHLY, YEARLY',
  })
  frequency!: RecurrenceFrequency;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsUUID()
  categoryId!: string;

  @IsEnum(PaymentMethod, {
    message: 'Método de pagamento inválido. Valores aceitos: DEBIT, CREDIT',
  })
  @IsOptional()
  paymentMethod?: PaymentMethod = PaymentMethod.DEBIT;
}
