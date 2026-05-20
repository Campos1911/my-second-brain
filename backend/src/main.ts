import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const port = configService.get<number>('PORT') || 3333;

  logger.log(
    `Conectando ao banco: ${databaseUrl ? 'OK (URL Carregada)' : 'ERRO (URL não encontrada)'}`,
  );

  await app.listen(port);
  logger.log(`Aplicação rodando na porta: ${port}`);
}
bootstrap();
