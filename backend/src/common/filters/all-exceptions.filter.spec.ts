import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  // Mocks para simular os objetos do Express/NestJS
  const mockStatus = jest.fn().mockReturnThis();
  const mockJson = jest.fn().mockReturnThis();

  const mockResponse = {
    status: mockStatus,
    json: mockJson,
  };

  const mockRequest = {
    url: '/test-route',
    method: 'POST',
  };

  const mockArgumentsHost = {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: () => mockResponse,
      getRequest: () => mockRequest,
    }),
  } as unknown as ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);

    // Limpa o histórico dos mocks entre cada caso de teste
    jest.clearAllMocks();
  });

  it('deve formatar corretamente exceções do tipo HttpException padrão', () => {
    const message = 'Dados inválidos';
    const exception = new HttpException(message, HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        path: '/test-route',
      }),
    );
  });

  it('deve mascarar erros conhecidos do Prisma (ex: P2002 - Unique Constraint)', () => {
    // Simula o erro conhecido do Prisma de violação de chave única
    const exception = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (email)',
      { code: 'P2002', clientVersion: '5.0.0' },
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message:
          'Conflito: Um registro com dados semelhantes já existe no sistema.',
        path: '/test-route',
      }),
    );
  });

  it('deve mascarar erros desconhecidos ou genéricos do banco de dados', () => {
    const exception = new Prisma.PrismaClientValidationError(
      'Invalid value for field...',
      { clientVersion: '5.0.0' },
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          'Estrutura ou dados de requisição incompatíveis com os requisitos.',
        path: '/test-route',
      }),
    );
  });

  it('deve tratar erros genéricos de runtime com o status 500 e mensagem segura', () => {
    const exception = new Error('Falha crítica de conexão de rede interna.');

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ocorreu uma instabilidade inesperada no servidor.',
        path: '/test-route',
      }),
    );
  });
});
