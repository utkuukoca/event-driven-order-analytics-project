import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.ANALYTICS_PORT ?? 3001);
  await app.listen(port);
  console.log(`Analytics service listening on http://localhost:${port}`);
}

bootstrap();
