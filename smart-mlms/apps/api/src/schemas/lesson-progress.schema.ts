import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonProgressDocument = LessonProgress & Document;

@Schema({ timestamps: true })
export class LessonProgress {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ required: true })
    chapterIndex: number;

    @Prop({ required: true })
    lessonIndex: number;

    @Prop({ default: false })
    isCompleted: boolean;

    @Prop({ default: 0 })
    watchTime: number; // seconds

    @Prop({ default: 0 })
    progress: number; // percentage 0-100

    @Prop()
    completedAt: Date;

    @Prop()
    lastAccessedAt: Date;
}

export const LessonProgressSchema = SchemaFactory.createForClass(LessonProgress);

// Unique compound index
LessonProgressSchema.index({ userId: 1, courseId: 1, chapterIndex: 1, lessonIndex: 1 }, { unique: true });
LessonProgressSchema.index({ userId: 1, courseId: 1 });
