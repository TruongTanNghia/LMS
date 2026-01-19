import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'admin@military.edu.vn' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'SecurePass123!' })
    @IsString()
    @IsNotEmpty()
    password: string;
}
