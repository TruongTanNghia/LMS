import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExamAttemptDocument = ExamAttempt & Document;

export enum ViolationType {
    FACE_NOT_DETECTED = 'FACE_NOT_DETECTED',
    MULTIPLE_FACES = 'MULTIPLE_FACES',
    LOOKING_AWAY = 'LOOKING_AWAY',
    TAB_SWITCH = 'TAB_SWITCH',
    FULLSCREEN_EXIT = 'FULLSCREEN_EXIT',
    PHONE_DETECTED = 'PHONE_DETECTED',
    AUDIO_ANOMALY = 'AUDIO_ANOMALY',
}

@Schema()
export class ExamViolation {
    @Prop({ type: String, enum: ViolationType, required: true })
    type: ViolationType;

    @Prop({ default: Date.now })
    timestamp: Date;

    @Prop()
    screenshot: string;

    @Prop()
    confidence: number;

    @Prop({ default: false })
    reviewed: boolean;

    @Prop()
    reviewedBy: Types.ObjectId;

    @Prop()
    action: string; // 'WARNING', 'FLAGGED', 'DISMISSED'
}

export const ExamViolationSchema = SchemaFactory.createForClass(ExamViolation);

@Schema()
export class Answer {
    @Prop({ required: true })
    questionIndex: number;

    @Prop()
    answer: string;

    @Prop()
    isCorrect: boolean;

    @Prop({ default: 0 })
    points: number;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);

@Schema({ timestamps: true })
export class ExamAttempt {
    @Prop({ type: Types.ObjectId, ref: 'Exam', required: true })
    examId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ default: Date.now })
    startedAt: Date;

    @Prop()
    submittedAt: Date;

    @Prop()
    score: number;

    @Prop({ default: false })
    isPassed: boolean;

    @Prop({ type: [AnswerSchema], default: [] })
    answers: Answer[];

    @Prop({ type: [ExamViolationSchema], default: [] })
    violations: ExamViolation[];

    @Prop({ default: 'IN_PROGRESS' })
    status: string; // 'IN_PROGRESS', 'SUBMITTED', 'GRADED', 'FLAGGED'

    @Prop([Number])
    questionOrder: number[]; // Shuffled question indices

    @Prop()
    ipAddress: string;

    @Prop()
    userAgent: string;
}

export const ExamAttemptSchema = SchemaFactory.createForClass(ExamAttempt);

// Indexes
ExamAttemptSchema.index({ examId: 1 });
ExamAttemptSchema.index({ userId: 1 });
ExamAttemptSchema.index({ status: 1 });
ExamAttemptSchema.index({ examId: 1, userId: 1 });
