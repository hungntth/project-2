import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors();

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  // Serve static files from public folder
  const publicPath = join(__dirname, '..', 'public');
  app.useStaticAssets(publicPath, {
    index: false,
  });

  // Serve index.html for all non-API routes (SPA routing)
  const httpAdapter = app.getHttpAdapter();
  const expressApp = httpAdapter.getInstance();
  
  // Use middleware to handle SPA routing
  expressApp.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // Skip static file requests (they should be handled by useStaticAssets)
    const ext = req.path.split('.').pop();
    if (ext && ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot'].includes(ext)) {
      return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(join(publicPath, 'index.html'));
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(
    `Application is running on: http://localhost:${port}/api`,
  );
  console.log(
    `Frontend is served at: http://localhost:${port}`,
  );
}
bootstrap();
