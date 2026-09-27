import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import type { AuthUser, JwtPayload } from './auth.types.js';
import {
  LoginResponseDto,
  RegisterResponseDto,
  RegisterUserDto,
} from './dtos/auth.dto.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<AuthUser | null> {
    const user = await this.usersService.findUserbyEmail(email);
    if (!user) {
      this.logger.warn(`User not found with email: ${email}`);
      return null;
    }

    const isCorrectPassword = await this.usersService.comparePassword(
      pass,
      user.password,
    );
    if (!isCorrectPassword) {
      this.logger.warn(`Invalid password for user with email: ${email}`);
      return null;
    }

    const { user_id, full_name, phone_number, status } = user;
    return { user_id, email: user.email, full_name, phone_number, status };
  }

  /** Creates the user and logs them in straight away. */
  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<RegisterResponseDto> {
    const user = await this.usersService.create(registerUserDto);
    return { ...this.login(user), user };
  }

  login(user: AuthUser): LoginResponseDto {
    const payload: JwtPayload = {
      sub: user.user_id,
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number,
      status: user.status,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
