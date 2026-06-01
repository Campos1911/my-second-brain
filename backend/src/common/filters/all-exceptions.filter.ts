import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Erro interno do servidor';

    // 1. Trata exceções padrão de HTTP do NestJS (ex: BadRequestException, NotFoundException)
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const errorResponse = exception.getResponse();

      // Mantém as mensagens de validação (geradas pelo class-validator) formatadas adequadamente
      message =
        typeof errorResponse === 'object' &&
        errorResponse !== null &&
        'message' in errorResponse
          ? (errorResponse as any).message
          : exception.message;
    }
    // 2. Trata erros mapeados do Prisma Client para evitar vazamento de detalhes estruturais
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': // Conflito de restrição de unicidade (Unique Constraint)
          statusCode = HttpStatus.CONFLICT;
          message =
            'Conflito: Um registro com dados semelhantes já existe no sistema.';
          break;
        case 'P2025': // Registro não encontrado
          statusCode = HttpStatus.NOT_FOUND;
          message = 'O registro solicitado não foi localizado.';
          break;
        case 'P2003': // Falha na restrição de chave estrangeira (Foreign Key Constraint)
          statusCode = HttpStatus.BAD_REQUEST;
          message =
            'Erro de integridade de dados relacionado a outros registros.';
          break;
        default:
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Falha no processamento de dados do banco de dados.';
          break;
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message =
        'Estrutura ou dados de requisição incompatíveis com os requisitos.';
    }
    // 3. Demais exceções de runtime não tratadas
    else if (exception instanceof Error) {
      message = 'Ocorreu uma instabilidade inesperada no servidor.';
    }

    // Registra o log do erro de forma completa internamente no console para a equipe de desenvolvimento
    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${statusCode} - Mensagem Interna: ${
        exception instanceof Error
          ? exception.message
          : JSON.stringify(exception)
      }`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Retorna a resposta ao usuário de acordo com o padrão estabelecido
    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
