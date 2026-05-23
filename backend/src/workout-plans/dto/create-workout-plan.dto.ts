import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateExerciseDto } from './create-exercise.dto';

export class CreateWorkoutPlanDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do plano de treino não pode ser vazio.' })
  name!: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseDto)
  exercises?: CreateExerciseDto[];
}
