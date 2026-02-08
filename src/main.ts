import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './utils/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:3000', // Assuming Swagger UI runs on the same domain/port as API in development
      ].filter(Boolean) as string[];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Restaurant API')
    .setDescription(
      'The restaurant API description. Refresh tokens are stored in HttpOnly cookies for security.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT access token',
      },
      'JWT-auth',
    )
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
      description:
        'Refresh token stored in HttpOnly cookie. Automatically set on login.',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory, {
    jsonDocumentUrl: 'api/json',
    yamlDocumentUrl: 'api/yaml',
    customSiteTitle: 'Restaurant API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      showExtensions: true,
      showCommonExtensions: true,
      withCredentials: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
