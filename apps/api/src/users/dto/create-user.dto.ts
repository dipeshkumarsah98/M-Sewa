import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty()
    email: string;

    @ApiProperty()
    full_name: string;

    @ApiProperty() 
    phone_number: string;

    @ApiProperty()
    dob: Date;

    @ApiProperty()
    password: string;
}
