import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserCreateDto } from './dto/user-create.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async validate(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(dto: UserCreateDto): Promise<UserDto> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findById(id: string): Promise<UserDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UserUpdateDto): Promise<UserDto> {
    await this.prismaService.user.findUniqueOrThrow({
      where: { id },
    });

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: {
        name: dto.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.user.findUniqueOrThrow({
      where: { id },
    });

    await this.prismaService.user.delete({
      where: { id },
    });
  }
}
