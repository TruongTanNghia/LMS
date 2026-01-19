import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    EXAM_START = 'EXAM_START',
    EXAM_SUBMIT = 'EXAM_SUBMIT',
    VIOLATION = 'VIOLATION',
}

@Schema({ timestamps: true })
export class AuditLog {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ type: String, enum: AuditAction, required: true })
    action: AuditAction;

    @Prop({ required: true })
    resource: string; // 'users', 'courses', 'exams', etc.

    @Prop()
    resourceId: string;

    @Prop({ type: Object })
    details: Record<string, any>;

    @Prop()
    ipAddress: string;

    @Prop()
    userAgent: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ resource: 1 });
AuditLogSchema.index({ createdAt: -1 });
