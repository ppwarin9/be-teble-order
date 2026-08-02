// Must run before AppModule (and anything it transitively imports, e.g.
// RealtimeGateway's `@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN } })`
// decorator) is required — decorator arguments evaluate at class-definition time,
// which happens during module resolution, before ConfigModule.forRoot() would
// otherwise populate process.env.
import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.use(helmet());

  app.enableCors({ origin: process.env.CORS_ORIGIN });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Strips fields marked @Exclude() (e.g. passwordHash) whenever a controller
  // returns a real class instance of a response DTO.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Handles standard Nest HttpExceptions (validation, 404, 401, ...). Prisma
  // errors are handled separately by PrismaExceptionFilter (see app.module.ts).
  app.useGlobalFilters(new HttpExceptionFilter());

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('The API description')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'bearer',
      )
      .addSecurityRequirements('bearer')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Application failed to start', error);
  process.exit(1);
});
