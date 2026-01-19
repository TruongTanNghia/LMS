import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = Course & Document;

export enum LessonType {
    VIDEO = 'VIDEO',
    DOCUMENT = 'DOCUMENT',
    SLIDE = 'SLIDE',
    TEXT = 'TEXT',
}

@Schema()
export class Lesson {
    @Prop({ required: true })
    title: string;

    @Prop({ type: String, enum: LessonType, default: LessonType.TEXT })
    type: LessonType;

    @Prop()
    content: string;

    @Prop()
    videoUrl: string;

    @Prop()
    fileUrl: string;

    @Prop({ default: 0 })
    duration: number; // minutes

    @Prop({ required: true })
    position: number;

    @Prop({ default: false })
    isPublished: boolean;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

@Schema()
export class Chapter {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    position: number;

    @Prop({ type: [LessonSchema], default: [] })
    lessons: Lesson[];
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);

@Schema({ timestamps: true })
export class Course {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop()
    thumbnail: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    instructorId: Types.ObjectId;

    @Prop({ default: false })
    isPublished: boolean;

    @Prop({ type: [ChapterSchema], default: [] })
    chapters: Chapter[];

    @Prop({ default: 0 })
    totalDuration: number;

    @Prop({ default: 0 })
    totalLessons: number;

    @Prop([String])
    tags: string[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Indexes
CourseSchema.index({ title: 'text', description: 'text' });
CourseSchema.index({ instructorId: 1 });
CourseSchema.index({ isPublished: 1 });
