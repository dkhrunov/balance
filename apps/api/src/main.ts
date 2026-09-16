/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ApiExceptionFilter } from './app/api-exception.filter';
import { createValidationPipe } from './app/create-validation-pipe';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const globalPrefix = 'api';

    app.setGlobalPrefix(globalPrefix);

    app.enableCors({
        origin: process.env.WEB_ORIGIN,
        credentials: true,
    });

    app.useGlobalPipes(createValidationPipe());
    app.useGlobalFilters(new ApiExceptionFilter());

    const port = process.env.PORT || 3000;

    await app.listen(port);

    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

void bootstrap();
