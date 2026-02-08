import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '../../generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    switch (exception.code) {
      case 'P2002':
        if (Array.isArray(exception.meta?.target)) {
          throw new BadRequestException(
            exception.meta.target.map((field) => `${field} is duplicated`),
          );
        }
        throw new BadRequestException('Unique constraint violation');
      case 'P2003':
        throw new BadRequestException(
          `${(exception.meta?.constraint as string)?.match(/(?<=_)([^_]+)(?=_)/)?.[0] ?? 'foreign key'} foreign key constraint was violated`,
        );
      case 'P2025':
        throw new NotFoundException();
    }
    super.catch(exception, host);
  }
}
