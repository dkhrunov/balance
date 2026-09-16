import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AUTH_ERROR_CODES } from '@balance/contracts/auth';

/** Builds the global HTTP validation pipe with project error shape. */
export function createValidationPipe(): ValidationPipe {
    return new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory: () =>
            new BadRequestException({
                code: AUTH_ERROR_CODES.invalidRequest,
                message: 'Request validation failed',
                details: {},
            }),
    });
}
