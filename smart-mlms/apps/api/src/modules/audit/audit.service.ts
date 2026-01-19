import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument, AuditAction } from '../../schemas/audit-log.schema';

@Injectable()
export class AuditService {
    constructor(
        @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>,
    ) { }

    async log(params: {
        userId?: string;
        action: AuditAction;
        resource: string;
        resourceId?: string;
        details?: Record<string, any>;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<AuditLogDocument> {
        return this.auditModel.create({
            userId: params.userId ? new Types.ObjectId(params.userId) : undefined,
            action: params.action,
            resource: params.resource,
            resourceId: params.resourceId,
            details: params.details,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
        });
    }

    async findAll(options: {
        userId?: string;
        action?: AuditAction;
        resource?: string;
        page?: number;
        limit?: number;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{ logs: AuditLogDocument[]; total: number }> {
        const { page = 1, limit = 50, userId, action, resource, startDate, endDate } = options;

        const query: any = {};
        if (userId) query.userId = new Types.ObjectId(userId);
        if (action) query.action = action;
        if (resource) query.resource = resource;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = startDate;
            if (endDate) query.createdAt.$lte = endDate;
        }

        const [logs, total] = await Promise.all([
            this.auditModel
                .find(query)
                .populate('userId', 'fullName email')
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 }),
            this.auditModel.countDocuments(query),
        ]);

        return { logs, total };
    }
}
