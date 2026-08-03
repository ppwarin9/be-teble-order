import { Prisma } from '@/database/generated/prisma/client';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface IPrismaError {
  code: string;
  message: string;
}

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'Unknown';

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = exception as IPrismaError;
      errorCode = prismaError.code;

      switch (prismaError.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'Conflict: Data already exists or unique constraint failed';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Not Found: Record to update/delete does not exist';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Bad Request: Foreign key constraint failed';
          break;
        default:
          // Never forward raw Prisma error text to the client — it can
          // reveal table/column names and query shape. Log it server-side
          // and return a generic message instead.
          status = HttpStatus.BAD_REQUEST;
          message = 'Bad Request: The database rejected this operation';
          this.logger.error(
            `Unhandled Prisma error [${errorCode}]: ${prismaError.message.replace(/\n/g, ' ')}`,
          );
          break;
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      // Reached by, e.g., an invalid enum value passed into a `where` filter —
      // malformed client input, not a server fault, so this is a 400 not a 500.
      status = HttpStatus.BAD_REQUEST;
      message = 'Bad Request: Invalid query input';
      errorCode = 'ValidationError';
      this.logger.error(
        `Prisma validation error: ${exception.message.replace(/\n/g, ' ')}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      error: errorCode,
    });
  }
}
