import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  private readonly transactionSelect: Prisma.TransactionSelect = {
    id: true,
    amount: true,
    description: true,
    date: true,
    category: {
      select: { id: true, name: true, type: true },
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    try {
      // Validar se a categoria pertence ao usuário ou é global
      const category = await this.prisma.category.findFirst({
        where: {
          id: dto.categoryId,
          OR: [{ userId }, { userId: null }],
          deletedAt: null,
        },
      });

      if (!category) throw new NotFoundException('Categoria não encontrada.');

      return await this.prisma.transaction.create({
        data: {
          amount: dto.amount,
          description: dto.description,
          date: dto.date ? new Date(dto.date) : new Date(),
          userId,
          categoryId: dto.categoryId,
        },
        select: this.transactionSelect,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('Erro ao criar transação.');
    }
  }

  async findAll(
    userId: string,
    page = 1,
    limit = 20,
    month?: number,
    year?: number,
  ) {
    const skip = (page - 1) * limit;

    // Monta dinamicamente a cláusula where do Prisma
    const whereClause: any = {
      userId,
      deletedAt: null,
    };

    // Se mês e ano forem providos, filtra pelo intervalo de data
    if (year && month) {
      // Date.UTC() cria o timestamp sem sofrer distorção de fuso horário do servidor
      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

      whereClause.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    // Promise.all para performance: busca total e dados em paralelo
    const [total, data] = await Promise.all([
      this.prisma.transaction.count({ where: whereClause }),
      this.prisma.transaction.findMany({
        where: whereClause,
        take: limit,
        skip,
        select: this.transactionSelect,
        orderBy: { date: 'desc' },
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
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
      select: this.transactionSelect,
    });

    if (!transaction) throw new NotFoundException('Transação não encontrada.');
    return transaction;
  }

  async remove(id: string, userId: string) {
    try {
      // Garantimos que o usuário só deleta o que é dele
      await this.prisma.transaction.update({
        where: { id, userId, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      return { message: 'Transação removida com sucesso.' };
    } catch (error) {
      throw new NotFoundException('Transação não encontrada ou já removida.');
    }
  }
}
