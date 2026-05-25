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
   * Valida se a categoria informada existe, pertence ao usuário (ou é global)
   * e possui o tipo correto (FITNESS).
   */
  private async validateFitnessCategory(
    categoryId: string,
    userId: string,
  ): Promise<void> {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        type: 'FITNESS',
        OR: [{ userId }, { userId: null }],
        deletedAt: null,
      },
    });

    if (!category) {
      throw new NotFoundException(
        `Categoria FITNESS correspondente ao ID ${categoryId} não foi encontrada ou está inativa.`,
      );
    }
  }

  async create(userId: string, dto: CreateWorkoutPlanDto) {
    // 1. Validar as categorias de todos os exercícios fornecidos
    if (dto.exercises && dto.exercises.length > 0) {
      for (const exercise of dto.exercises) {
        await this.validateFitnessCategory(exercise.categoryId, userId);
      }
    }

    try {
      // 2. Criar o plano de treino e os exercícios associados de forma transacional
      return await this.prisma.workoutPlan.create({
        data: {
          name: dto.name,
          userId,
          exercises: {
            create: dto.exercises?.map((ex) => ({
              name: ex.name,
              categoryId: ex.categoryId,
            })),
          },
        },
        include: {
          exercises: {
            where: { deletedAt: null },
            select: { id: true, name: true, categoryId: true },
          },
        },
      });
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
            select: { id: true, name: true, categoryId: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      data,
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
            category: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plano de treino não encontrado.');
    }

    return plan;
  }

  async update(id: string, userId: string, dto: UpdateWorkoutPlanDto) {
    // Garante que o recurso existe e pertence ao usuário autenticado
    await this.findOne(id, userId);

    try {
      return await this.prisma.workoutPlan.update({
        where: { id },
        data: {
          name: dto.name,
        },
        include: {
          exercises: {
            where: { deletedAt: null },
            select: { id: true, name: true },
          },
        },
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
      // Soft delete em cascata: plano de treino e exercícios vinculados
      await this.prisma.$transaction(async (tx) => {
        const now = new Date();

        await tx.workoutPlan.update({
          where: { id },
          data: { deletedAt: now },
        });

        await tx.exercise.updateMany({
          where: { workoutPlanId: id, deletedAt: null },
          data: { deletedAt: now },
        });
      });

      return {
        message:
          'Plano de treino e exercícios associados removidos com sucesso.',
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Erro ao remover o plano de treino.',
      );
    }
  }
}
