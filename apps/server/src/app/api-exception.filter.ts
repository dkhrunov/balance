import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '@balance/contracts/common';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
    public catch(exception: unknown, host: ArgumentsHost): void {
        // eslint-disable-next-line code-complete/enforce-meaningful-names
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        // const request = ctx.getRequest<Request>();

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const errorResponse = exception.getResponse();
            const fallbackResponse = {
                code: `HTTP_${String(status)}`,
                message: exception.message,
                details: {},
            } satisfies ApiErrorResponse;
            const body = this.isApiErrorResponse(errorResponse) ? errorResponse : fallbackResponse;

            response.status(status).json(body);

            return;
        }

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
            details: {},
        } satisfies ApiErrorResponse);
    }

    private isApiErrorResponse(value: unknown): value is ApiErrorResponse {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            return false;
        }

        const candidate = value as Record<string, unknown>;

        return (
            typeof candidate.code === 'string' &&
            typeof candidate.message === 'string' &&
            typeof candidate.details === 'object' &&
            candidate.details !== null &&
            !Array.isArray(candidate.details)
        );
    }
}
