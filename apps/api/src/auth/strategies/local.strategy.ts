import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service.js';
import type { AuthUser } from '../auth.types.js';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<AuthUser> {
    // is email in the whiteiist of allowed emails
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
    const emailDomain = email.split('@')[1].split('.')[0];
    if (!allowedEmails.includes(emailDomain)) {
      throw new UnauthorizedException('Email domain is not allowed');
    }
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }
}
