import {
  Catch,
  type ArgumentsHost,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

const dependencyErrorCodes = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'ENOTFOUND',
  'P1001',
  'P1002',
  'P2028',
]);

export function isDependencyUnavailable(exception: unknown): boolean {
  if (!(exception instanceof Error)) return false;
  const code = (exception as Error & { code?: string }).code;
  return (
    (typeof code === 'string' && dependencyErrorCodes.has(code)) ||
    exception.name === 'MaxRetriesPerRequestError'
  );
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<FastifyRequest>();
    const response = context.getResponse<FastifyReply>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : isDependencyUnavailable(exception)
          ? HttpStatus.SERVICE_UNAVAILABLE
          : HttpStatus.INTERNAL_SERVER_ERROR;
    const title = HttpStatus[status] ?? 'Error';
    if (!(exception instanceof HttpException))
      this.logger.error(
        exception instanceof Error
          ? exception.stack
          : `Unhandled request exception: ${String(exception)}`,
      );
    const detail =
      exception instanceof HttpException
        ? this.safeDetail(exception.getResponse(), title)
        : status === 503
          ? 'A required dependency is temporarily unavailable'
          : 'An unexpected error occurred';
    void response
      .status(status)
      .type('application/problem+json')
      .send({
        correlationId: request.id,
        detail,
        instance: request.url,
        status,
        title,
        type: `https://nexo.local/problems/${String(status)}`,
      });
  }

  private safeDetail(response: string | object, fallback: string): string {
    if (typeof response === 'string') return response;
    if ('message' in response) {
      const message = response.message;
      if (typeof message === 'string') return message;
      if (Array.isArray(message)) return message.map(String).join('; ');
    }
    return fallback;
  }
}
