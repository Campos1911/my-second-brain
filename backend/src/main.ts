import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Utilização do tipo específico para acessar métodos de configuração do Express
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Habilita a confiança nos cabeçalhos de proxy (essencial para capturar o IP real do cliente sob Nginx, Cloudflare, etc.)
  app.set('trust proxy', 1);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Second Brain API')
    .setDescription(
      'API RESTful modularizada para controle financeiro, investimentos, categorias e rotinas de treinos.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entre com o token JWT gerado na rota /auth/login',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

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
