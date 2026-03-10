import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { STATUS_CODES } from 'http';
import { Request, Response } from 'express';

type ErrorPayload = {
  statusCode: number;
  error: string;
  message: string;
  details: string[] | null;
  timestamp: string;
  path: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const parsed = this.parseHttpExceptionResponse(exceptionResponse, statusCode);

      const payload: ErrorPayload = {
        statusCode,
        error: parsed.error,
        message: parsed.message,
        details: parsed.details,
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      response.status(statusCode).json(payload);
      return;
    }

    const payload: ErrorPayload = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      details: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(payload);
  }

  private parseHttpExceptionResponse(
    exceptionResponse: string | object,
    statusCode: number,
  ): { error: string; message: string; details: string[] | null } {
    if (typeof exceptionResponse === 'string') {
      return {
        error: this.defaultErrorText(statusCode),
        message: exceptionResponse,
        details: null,
      };
    }

    const responseObject = exceptionResponse as {
      error?: string;
      message?: string | string[];
    };

    const error = responseObject.error ?? this.defaultErrorText(statusCode);

    if (Array.isArray(responseObject.message)) {
      return {
        error,
        message: 'Validation failed',
        details: responseObject.message,
      };
    }

    return {
      error,
      message: responseObject.message ?? error,
      details: null,
    };
  }

  private defaultErrorText(statusCode: number): string {
    const reason = STATUS_CODES[statusCode];
    return typeof reason === 'string' ? reason : 'Error';
  }
}
