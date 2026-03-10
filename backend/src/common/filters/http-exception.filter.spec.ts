import { ArgumentsHost, BadRequestException, HttpException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  it('returns normalized shape for HttpException', () => {
    const filter = new HttpExceptionFilter();

    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ url: '/test-path' }),
      }),
    } as unknown as ArgumentsHost;

    const exception = new HttpException('Resource not found', 404);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        error: 'Not Found',
        message: 'Resource not found',
        details: null,
        path: '/test-path',
        timestamp: expect.any(String),
      }),
    );
  });

  it('normalizes validation errors with details array', () => {
    const filter = new HttpExceptionFilter();

    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ url: '/validation-path' }),
      }),
    } as unknown as ArgumentsHost;

    const exception = new BadRequestException([
      'id must be a UUID',
      'name should not be empty',
    ]);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: ['id must be a UUID', 'name should not be empty'],
        path: '/validation-path',
      }),
    );
  });
});
