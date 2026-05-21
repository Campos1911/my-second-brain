import {
  IsNumber,
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateTransactionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  amount!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsUUID()
  categoryId!: string;

  @IsIn(['DEBIT', 'CREDIT'], {
    message: 'O método de pagamento deve ser DEBIT ou CREDIT.',
  })
  @IsOptional()
  paymentMethod?: 'DEBIT' | 'CREDIT' = 'DEBIT';
}
