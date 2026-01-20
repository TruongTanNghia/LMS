import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnitType, UnitCategory } from '../../../schemas/unit.schema';

export class CreateUnitDto {
    @ApiProperty({ example: 'Khoa Công nghệ Thông tin' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'CNTT' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ enum: UnitType })
    @IsOptional()
    @IsEnum(UnitType)
    type?: UnitType;

    @ApiPropertyOptional({ enum: UnitCategory })
    @IsOptional()
    @IsEnum(UnitCategory)
    category?: UnitCategory;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    parentId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    order?: number;
}
