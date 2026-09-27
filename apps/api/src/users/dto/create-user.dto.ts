import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com', format: 'email' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  full_name: string;

  @ApiProperty({ example: '9800000000' })
  phone_number: string;

  @ApiProperty({ example: '1998-01-31', type: String, format: 'date' })
  dob: Date;

  @ApiProperty({ example: 'P@ssw0rd!', format: 'password' })
  password: string;
}
