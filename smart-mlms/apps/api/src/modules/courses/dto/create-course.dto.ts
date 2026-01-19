import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LessonType } from '../../../schemas/course.schema';

export class CreateLessonDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional({ enum: LessonType })
    @IsOptional()
    @IsEnum(LessonType)
    type?: LessonType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    content?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    videoUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fileUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    duration?: number;

    @ApiProperty()
    @IsNumber()
    position: number;
}

export class CreateChapterDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty()
    @IsNumber()
    position: number;

    @ApiPropertyOptional({ type: [CreateLessonDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateLessonDto)
    lessons?: CreateLessonDto[];
}

export class CreateCourseDto {
    @ApiProperty({ example: 'Chiến thuật quân sự cơ bản' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    thumbnail?: string;

    @ApiPropertyOptional({ type: [CreateChapterDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateChapterDto)
    chapters?: CreateChapterDto[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
