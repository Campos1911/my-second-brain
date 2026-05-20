import {
  IsNumber,
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
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
}
