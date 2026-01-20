import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UnitDocument = Unit & Document;

// Enum phân loại đơn vị
export enum UnitType {
    SCHOOL = 'SCHOOL',           // Nhà trường (root)
    FACULTY = 'FACULTY',         // Khoa
    INSTITUTE = 'INSTITUTE',     // Viện
    DEPARTMENT = 'DEPARTMENT',   // Bộ môn
    OFFICE = 'OFFICE',           // Phòng
    DIVISION = 'DIVISION',       // Ban
    BATTALION = 'BATTALION',     // Tiểu đoàn
    COMPANY = 'COMPANY',         // Đại đội  
    CLASS = 'CLASS',             // Lớp học viên
}

// Nhóm loại đơn vị
export enum UnitCategory {
    ACADEMIC = 'ACADEMIC',       // Khoa, Viện, Bộ môn
    ADMINISTRATIVE = 'ADMINISTRATIVE', // Phòng, Ban
    MILITARY = 'MILITARY',       // Tiểu đoàn, Đại đội, Lớp
}

@Schema({ timestamps: true })
export class Unit {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    code: string;

    @Prop()
    description: string;

    @Prop({ type: String, enum: UnitType, default: UnitType.DEPARTMENT })
    type: UnitType;

    @Prop({ type: String, enum: UnitCategory })
    category: UnitCategory;

    @Prop({ type: Types.ObjectId, ref: 'Unit' })
    parentId: Types.ObjectId;

    @Prop({ default: 0 })
    level: number;

    @Prop({ default: 0 })
    order: number; // Thứ tự hiển thị

    @Prop({ default: true })
    isActive: boolean;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);

// Indexes
UnitSchema.index({ code: 1 });
UnitSchema.index({ parentId: 1 });
UnitSchema.index({ type: 1 });
UnitSchema.index({ category: 1 });
UnitSchema.index({ level: 1, order: 1 });
