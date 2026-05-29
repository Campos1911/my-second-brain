import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateWorkoutPlanDto {
  /**
   * Nome do plano de treino.
   * @example "Treino A - Peito & Tríceps"
   */
  @IsString()
  @IsNotEmpty({ message: 'O nome do plano de treino não pode ser vazio.' })
  name!: string;

  /**
   * IDs dos exercícios da biblioteca que serão vinculados a este plano.
   * @example ["e6844973-2fc8-47fb-94cb-fa22cebf27bc"]
   */
  @IsArray()
  @IsOptional()
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de exercício deve ser um UUID válido.',
  })
  exerciseIds?: string[];
}
