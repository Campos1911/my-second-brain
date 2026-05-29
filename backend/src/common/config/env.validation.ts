// src/common/config/env.validation.ts

import { plainToInstance } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty({ message: 'A variável DATABASE_URL é obrigatória.' })
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty({ message: 'A variável JWT_SECRET é obrigatória.' })
  JWT_SECRET!: string;

  @IsNumber()
  @IsOptional()
  PORT?: number;
}

export function validate(config: Record<string, any>) {
  // Transforma o objeto de configuração bruto aplicando conversões implícitas (ex: string para number no campo PORT)
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((err) => {
        return Object.values(err.constraints || {}).join(', ');
      })
      .join(' | ');

    throw new Error(`[Env Validation Error]: ${errorMessages}`);
  }

  return validatedConfig;
}
