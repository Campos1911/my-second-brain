import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class WorkoutPlansService {
  private readonly logger = new Logger(WorkoutPlansService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida se todos os exercícios fornecidos existem na biblioteca e estão acessíveis ao usuário.
   */
  private async validateExercisesAccessibility(
    exerciseIds: string[],
    userId: string,
  ): Promise<void> {
    const count = await this.prisma.exercise.count({
      where: {
        id: { in: exerciseIds },
        deletedAt: null,
        OR: [
          { userId },
          { userId: null }, // Exercícios globais
        ],
      },
    });

    if (count !== exerciseIds.length) {
      throw new NotFoundException(
        'Um ou mais exercícios fornecidos não foram encontrados ou estão inacessíveis.',
      );
    }
  }

  /**
   * Helper para formatar o retorno do plano de treino, mantendo a compatibilidade da API
   * ao extrair os exercícios de dentro da relação da tabela intermediária.
   */
  private formatWorkoutPlan(plan: any) {
    return {
      id: plan.id,
      name: plan.name,
      userId: plan.userId,
      deletedAt: plan.deletedAt,
      exercises: plan.exercises
        ? plan.exercises.map((wpe: any) => ({
            associationId: wpe.id, // ID da associação na tabela intermediária
            id: wpe.exercise.id,
            name: wpe.exercise.name,
            categoryId: wpe.exercise.categoryId,
            category: wpe.exercise.category,
          }))
        : [],
    };
  }

  async create(userId: string, dto: CreateWorkoutPlanDto) {
    if (dto.exerciseIds && dto.exerciseIds.length > 0) {
      await this.validateExercisesAccessibility(dto.exerciseIds, userId);
    }

    try {
      const plan = await this.prisma.workoutPlan.create({
        data: {
          name: dto.name,
          userId,
          exercises: {
            create: dto.exerciseIds?.map((exerciseId) => ({
              exerciseId,
            })),
          },
        },
        include: {
          exercises: {
            where: { deletedAt: null },
            include: {
              exercise: {
                select: { id: true, name: true, categoryId: true },
              },
            },
          },
        },
      });

      return this.formatWorkoutPlan(plan);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Erro ao criar o plano de treino.',
      );
    }
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where: Prisma.WorkoutPlanWhereInput = {
      userId,
      deletedAt: null,
    };

    const [total, data] = await Promise.all([
      this.prisma.workoutPlan.count({ where }),
      this.prisma.workoutPlan.findMany({
        where,
        take: limit,
        skip,
        include: {
          exercises: {
            where: { deletedAt: null },
            include: {
              exercise: {
                select: { id: true, name: true, categoryId: true },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      data: data.map((plan) => this.formatWorkoutPlan(plan)),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string, userId: string) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        exercises: {
          where: { deletedAt: null },
          include: {
            exercise: {
              include: {
                category: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plano de treino não encontrado.');
    }

    return this.formatWorkoutPlan(plan);
  }

  async update(id: string, userId: string, dto: UpdateWorkoutPlanDto) {
    // Garante que o recurso existe e pertence ao usuário autenticado
    await this.findOne(id, userId);

    if (dto.exerciseIds) {
      await this.validateExercisesAccessibility(dto.exerciseIds, userId);
    }

    try {
      // Sincroniza as associações de forma transacional
      return await this.prisma.$transaction(async (tx) => {
        // 1. Atualiza o cabeçalho do plano de treino
        await tx.workoutPlan.update({
          where: { id },
          data: {
            name: dto.name,
          },
        });

        // 2. Se a lista de IDs de exercícios foi fornecida, atualiza as associações
        if (dto.exerciseIds !== undefined) {
          // Desvincula de forma lógica (soft-delete) os exercícios atuais
          await tx.workoutPlanExercise.updateMany({
            where: { workoutPlanId: id, deletedAt: null },
            data: { deletedAt: new Date() },
          });

          // Cria as novas vinculações na tabela intermediária
          if (dto.exerciseIds.length > 0) {
            await tx.workoutPlanExercise.createMany({
              data: dto.exerciseIds.map((exerciseId) => ({
                workoutPlanId: id,
                exerciseId,
              })),
            });
          }
        }

        // Recupera o plano de treino completo e atualizado
        const updatedPlan = await tx.workoutPlan.findUnique({
          where: { id },
          include: {
            exercises: {
              where: { deletedAt: null },
              include: {
                exercise: {
                  select: { id: true, name: true, categoryId: true },
                },
              },
            },
          },
        });

        return this.formatWorkoutPlan(updatedPlan);
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Erro ao atualizar o plano de treino.',
      );
    }
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    try {
      // Soft-delete em cascata: plano de treino e associações da tabela intermediária
      await this.prisma.$transaction(async (tx) => {
        const now = new Date();

        await tx.workoutPlan.update({
          where: { id },
          data: { deletedAt: now },
        });

        await tx.workoutPlanExercise.updateMany({
          where: { workoutPlanId: id, deletedAt: null },
          data: { deletedAt: now },
        });
      });

      return {
        message:
          'Plano de treino e associações de exercícios removidos com sucesso.',
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Erro ao remover o plano de treino.',
      );
    }
  }
}
