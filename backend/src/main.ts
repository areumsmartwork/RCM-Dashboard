import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 프론트(3000)에서 백엔드(3001)로 요청 허용
  app.enableCors({ origin: 'http://localhost:3000' });

  // 모든 API 경로에 /api 접두어
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}/api`);
}
void bootstrap();
