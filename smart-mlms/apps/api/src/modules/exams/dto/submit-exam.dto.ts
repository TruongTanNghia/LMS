import { IsArray, ValidateNested, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AnswerDto {
    @ApiProperty()
    @IsNumber()
    questionIndex: number;

    @ApiProperty()
    @IsString()
    answer: string;
}

export class SubmitExamDto {
    @ApiProperty({ type: [AnswerDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers: AnswerDto[];
}
