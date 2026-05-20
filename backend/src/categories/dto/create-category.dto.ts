import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { CategoryType } from '../../generated/prisma/client';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(CategoryType, {
    message: 'Tipo de categoria inválido. Use: INCOME, EXPENSE ou FITNESS',
  })
  type!: CategoryType;
}
