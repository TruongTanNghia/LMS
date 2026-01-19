import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum Role {
    ADMIN = 'ADMIN',
    TEACHER = 'TEACHER',
    STUDENT = 'STUDENT',
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    fullName: string;

    @Prop()
    militaryId: string;

    @Prop()
    rank: string;

    @Prop({ type: String, enum: Role, default: Role.STUDENT })
    role: Role;

    @Prop({ type: Types.ObjectId, ref: 'Unit' })
    unitId: Types.ObjectId;

    @Prop({ default: 100 })
    trustScore: number;

    @Prop({ default: true })
    isActive: boolean;

    @Prop()
    lastLogin: Date;

    @Prop()
    avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ unitId: 1 });
UserSchema.index({ role: 1 });
