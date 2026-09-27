import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import bcrypt from 'bcrypt';

// Every field except `password` — never return the hash from the API.
const PUBLIC_USER_FIELDS = {
  user_id: true,
  email: true,
  full_name: true,
  phone_number: true,
  dob: true,
  status: true,
  kyc_tier: true,
  created_at: true,
  updated_at: true,
} as const;

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  private readonly logger = new Logger(UsersService.name);

  constructor(readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    this.logger.log('Creating a new user');
    const allowedEmails = [
      'gmail',
      'yahoo',
      'outlook',
      'hotmail',
      'icloud',
      'aol',
      'protonmail',
      'zoho',
      'gmx',
      'mail.com',
    ];
    const emailDomain = createUserDto.email.split('@')[1].split('.')[0];
    console.log('Email domain:', emailDomain);
    if (!allowedEmails.includes(emailDomain)) {
      throw new UnauthorizedException('Email domain is not allowed');
    }
    const { dob, email, full_name, phone_number, password } = createUserDto;
    try {
      const existingUser = await this.findUserbyEmail(createUserDto.email);
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

      const newUser = await this.prismaService.user.create({
        data: {
          user_id: crypto.randomUUID(),
          email,
          full_name,
          phone_number,
          dob: new Date(dob),
          password: hashedPassword, // Store the hashed password instead of the plain text password
          status: 'active', // Set the default status to 'active'
          kyc_tier: 'not_verified', // Set the default KYC tier to 'not_verified'
        },
        select: PUBLIC_USER_FIELDS,
      });
      return newUser;
    } catch (error: any) {
      this.logger.error('Error creating user', error.stack);
      throw error;
    }
  }

  async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error: any) {
      this.logger.error('Error comparing passwords', error.stack);
      throw error;
    }
  }

  async findAll() {
    this.logger.log('Finding all users');
    try {
      const res = await this.prismaService.user.findMany({
        select: PUBLIC_USER_FIELDS,
      });
      this.logger.log(`Found ${res.length} users`);
      return res;
    } catch (error: any) {
      this.logger.error('Error finding all users', error.stack);
      throw error;
    }
  }

  /** Returns the full record including the password hash — for auth only. */
  async findUserbyEmail(email: string) {
    this.logger.log(`Finding user with email: ${email}`);
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: email },
      });
      this.logger.log(`Found user with email: ${email}`);
      return user;
    } catch (error: any) {
      this.logger.error(`Error finding user with email: ${email}`, error.stack);
      throw error;
    }
  }

  async findOne(uuid: string) {
    try {
      this.logger.log(`Finding user with UUID: ${uuid}`);
      const user = await this.prismaService.user.findUnique({
        where: { user_id: uuid },
        select: PUBLIC_USER_FIELDS,
      });
      if (!user) {
        throw new NotFoundException(`User ${uuid} not found`);
      }
      this.logger.log(`Found user with UUID: ${uuid}`);
      return user;
    } catch (error: any) {
      this.logger.error(`Error finding user with UUID: ${uuid}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      this.logger.log(`Updating user with ID: ${id}`);
      await this.findOne(id);

      const { password, dob, ...rest } = updateUserDto;
      const updatedUser = await this.prismaService.user.update({
        where: { user_id: id },
        data: {
          ...rest,
          ...(dob !== undefined && { dob: new Date(dob) }),
          ...(password !== undefined && {
            password: await bcrypt.hash(password, this.SALT_ROUNDS),
          }),
        },
        select: PUBLIC_USER_FIELDS,
      });

      return updatedUser;
    } catch (error: any) {
      this.logger.error(`Error updating user with ID: ${id}`, error.stack);
      throw error;
    }
  }
}
