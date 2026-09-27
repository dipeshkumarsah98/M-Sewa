import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  user_id: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  full_name: string;

  @ApiProperty({ example: '9800000000' })
  phone_number: string;

  @ApiProperty({ type: String, format: 'date-time' })
  dob: Date;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: 'not_verified' })
  kyc_tier: string;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updated_at: Date;
}
