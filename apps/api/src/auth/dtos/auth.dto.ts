import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/create-user.dto.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';

export class RegisterUserDto extends CreateUserDto {}

export class LoginUserDto {
  @ApiProperty({ example: 'john@example.com', format: 'email' })
  email: string;

  @ApiProperty({ example: 'P@ssw0rd!', format: 'password' })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT to send as `Authorization: Bearer <token>`',
  })
  access_token: string;
}

export class RegisterResponseDto extends LoginResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

export class AuthUserDto {
  @ApiProperty({ format: 'uuid' })
  user_id: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  full_name: string;

  @ApiProperty({ example: '9800000000' })
  phone_number: string;

  @ApiProperty({ example: 'active' })
  status: string;
}
