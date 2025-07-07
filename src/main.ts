import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS
  app.enableCors();
  
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('NestJS API with Swagger and MySQL')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Get port from config service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}

bootstrap();
