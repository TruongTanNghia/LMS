import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExamDocument = Exam & Document;

export enum QuestionType {
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    TRUE_FALSE = 'TRUE_FALSE',
    SHORT_ANSWER = 'SHORT_ANSWER',
    ESSAY = 'ESSAY',
}

export enum Difficulty {
    EASY = 'EASY',
    MEDIUM = 'MEDIUM',
    HARD = 'HARD',
}

@Schema()
export class Question {
    @Prop({ type: String, enum: QuestionType, required: true })
    type: QuestionType;

    @Prop({ required: true })
    content: string;

    @Prop([String])
    options: string[];

    @Prop({ required: true })
    correctAnswer: string;

    @Prop()
    explanation: string;

    @Prop({ default: 1 })
    points: number;

    @Prop({ type: String, enum: Difficulty, default: Difficulty.MEDIUM })
    difficulty: Difficulty;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({ timestamps: true })
export class Exam {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    duration: number; // minutes

    @Prop({ required: true })
    totalPoints: number;

    @Prop({ required: true })
    passScore: number;

    @Prop({ default: true })
    shuffleQuestions: boolean;

    @Prop({ default: true })
    shuffleOptions: boolean;

    @Prop({ default: 1 })
    maxAttempts: number;

    @Prop()
    startTime: Date;

    @Prop()
    endTime: Date;

    @Prop({ default: false })
    isPublished: boolean;

    @Prop({ default: true })
    requireProctoring: boolean;

    @Prop({ type: [QuestionSchema], default: [] })
    questions: Question[];
}

export const ExamSchema = SchemaFactory.createForClass(Exam);

// Indexes
ExamSchema.index({ courseId: 1 });
ExamSchema.index({ isPublished: 1 });
ExamSchema.index({ startTime: 1, endTime: 1 });
