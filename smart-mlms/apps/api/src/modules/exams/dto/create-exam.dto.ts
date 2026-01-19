import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsEnum, IsNumber, IsBoolean, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { QuestionType, Difficulty } from '../../../schemas/exam.schema';

export class CreateQuestionDto {
    @ApiProperty({ enum: QuestionType })
    @IsEnum(QuestionType)
    type: QuestionType;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    options?: string[];

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    correctAnswer: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    explanation?: string;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @IsNumber()
    points?: number;

    @ApiPropertyOptional({ enum: Difficulty })
    @IsOptional()
    @IsEnum(Difficulty)
    difficulty?: Difficulty;
}

export class CreateExamDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    courseId: string;

    @ApiProperty({ example: 'Kiểm tra giữa kỳ' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 60 })
    @IsNumber()
    duration: number;

    @ApiProperty({ example: 60 })
    @IsNumber()
    passScore: number;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    shuffleQuestions?: boolean;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    shuffleOptions?: boolean;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @IsNumber()
    maxAttempts?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Date)
    startTime?: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Date)
    endTime?: Date;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    requireProctoring?: boolean;

    @ApiPropertyOptional({ type: [CreateQuestionDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    questions?: CreateQuestionDto[];
}
