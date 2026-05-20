import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'https://my-second-brain-orpin.vercel.app/',
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

  const port = process.env.PORT || configService.get<string>('PORT') || 8080;

  logger.log(
    `Conectando ao banco: ${databaseUrl ? 'OK (URL Carregada)' : 'ERRO (URL não encontrada)'}`,
  );

  await app.listen(port, '0.0.0.0');
  logger.log(`Aplicação rodando na porta: ${port}`);
}
bootstrap();
