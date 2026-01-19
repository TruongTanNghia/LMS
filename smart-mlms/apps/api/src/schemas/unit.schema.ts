import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UnitDocument = Unit & Document;

@Schema({ timestamps: true })
export class Unit {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    code: string;

    @Prop()
    description: string;

    @Prop({ type: Types.ObjectId, ref: 'Unit' })
    parentId: Types.ObjectId;

    @Prop({ default: 0 })
    level: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);

// Indexes
UnitSchema.index({ code: 1 });
UnitSchema.index({ parentId: 1 });
