import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { FindExercisesQueryDto } from './dto/find-exercises-query.dto';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class ExercisesService {
  private readonly logger = new Logger(ExercisesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida se o plano de treino existe e pertence ao usuário autenticado.
   */
  private async validateWorkoutPlanOwnership(
    workoutPlanId: string,
    userId: string,
  ): Promise<void> {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: {
        id: workoutPlanId,
        userId,
        deletedAt: null,
      },
    });

    if (!plan) {
      throw new NotFoundException(
        'Plano de treino não encontrado ou indisponível.',
      );
    }
  }

  /**
   * Valida se a categoria é do tipo FITNESS e se o usuário tem acesso (dona ou global).
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
        'Categoria FITNESS inválida, inativa ou inexistente.',
      );
    }
  }

  async create(userId: string, dto: CreateExerciseDto) {
    await this.validateWorkoutPlanOwnership(dto.workoutPlanId, userId);
    await this.validateFitnessCategory(dto.categoryId, userId);

    try {
      return await this.prisma.exercise.create({
        data: {
          name: dto.name,
          categoryId: dto.categoryId,
          workoutPlanId: dto.workoutPlanId,
        },
        include: {
          category: {
            select: { id: true, name: true },
          },
          workoutPlan: {
            select: { id: true, name: true },
          },
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Erro ao criar o exercício.');
    }
  }

  async findAll(userId: string, query: FindExercisesQueryDto) {
    const { page = 1, limit = 20, search, categoryId, workoutPlanId } = query;
    const skip = (page - 1) * limit;

    // Garante que o usuário só liste exercícios de planos de treino que pertencem a ele
    const whereClause: Prisma.ExerciseWhereInput = {
      deletedAt: null,
      workoutPlan: {
        userId,
        deletedAt: null,
      },
    };

    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (workoutPlanId) {
      whereClause.workoutPlanId = workoutPlanId;
    }

    try {
      const [total, data] = await Promise.all([
        this.prisma.exercise.count({ where: whereClause }),
        this.prisma.exercise.findMany({
          where: whereClause,
          take: limit,
          skip,
          include: {
            category: {
              select: { id: true, name: true },
            },
            workoutPlan: {
              select: { id: true, name: true },
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
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Erro ao buscar exercícios.');
    }
  }

  async findOne(id: string, userId: string) {
    const exercise = await this.prisma.exercise.findFirst({
      where: {
        id,
        deletedAt: null,
        workoutPlan: {
          userId,
          deletedAt: null,
        },
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
        workoutPlan: {
          select: { id: true, name: true },
        },
      },
    });

    if (!exercise) {
      throw new NotFoundException('Exercício não encontrado.');
    }

    return exercise;
  }

  async update(id: string, userId: string, dto: UpdateExerciseDto) {
    // Valida existência e propriedade do exercício antes de atualizar
    await this.findOne(id, userId);

    if (dto.workoutPlanId) {
      await this.validateWorkoutPlanOwnership(dto.workoutPlanId, userId);
    }

    if (dto.categoryId) {
      await this.validateFitnessCategory(dto.categoryId, userId);
    }

    try {
      return await this.prisma.exercise.update({
        where: { id },
        data: {
          name: dto.name,
          categoryId: dto.categoryId,
          workoutPlanId: dto.workoutPlanId,
        },
        include: {
          category: {
            select: { id: true, name: true },
          },
          workoutPlan: {
            select: { id: true, name: true },
          },
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Erro ao atualizar o exercício.');
    }
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    try {
      await this.prisma.exercise.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { message: 'Exercício removido com sucesso.' };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Erro ao remover o exercício.');
    }
  }
}
