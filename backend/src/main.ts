import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  console.log('BOOT 1: starting bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  console.log('BOOT 2: nest app created');

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors({
    origin: ['http://localhost:5173', 'https://app.alfasport.bg', 'https://alfasport.bg'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(process.env.PORT) || 3000;
  console.log('BOOT 3: about to listen on port', port);

  await app.listen(port, '0.0.0.0');
  console.log('BOOT 4: app is listening');
}

bootstrap().catch((err) => {
  console.error('BOOT ERROR:', err);
});