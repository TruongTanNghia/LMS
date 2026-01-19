import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUnitDto {
    @ApiProperty({ example: 'Tiểu đoàn 1' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'TD1' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    parentId?: string;
}
