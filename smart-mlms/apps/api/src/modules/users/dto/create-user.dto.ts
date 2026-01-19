import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../schemas/user.schema';

export class CreateUserDto {
    @ApiProperty({ example: 'user@military.edu.vn' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'SecurePass123!' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @ApiProperty({ example: 'Nguyễn Văn An' })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiPropertyOptional({ enum: Role, default: Role.STUDENT })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    unitId?: string;

    @ApiPropertyOptional({ example: 'QN-2024-001' })
    @IsOptional()
    @IsString()
    militaryId?: string;

    @ApiPropertyOptional({ example: 'Thượng úy' })
    @IsOptional()
    @IsString()
    rank?: string;
}
