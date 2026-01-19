import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClassDocument = Class & Document;

@Schema({ timestamps: true })
export class Class {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    code: string;

    @Prop({ type: Types.ObjectId, ref: 'Unit', required: true })
    unitId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    instructorId: Types.ObjectId;

    @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
    studentIds: Types.ObjectId[];

    @Prop()
    startDate: Date;

    @Prop()
    endDate: Date;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: 0 })
    maxStudents: number;
}

export const ClassSchema = SchemaFactory.createForClass(Class);

// Indexes
ClassSchema.index({ code: 1 });
ClassSchema.index({ unitId: 1 });
ClassSchema.index({ courseId: 1 });
ClassSchema.index({ instructorId: 1 });
