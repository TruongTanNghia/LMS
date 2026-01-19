import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, Role } from '../../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<UserDocument> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
        return this.userModel.create({
            ...createUserDto,
            password: hashedPassword,
        });
    }

    async findAll(options: {
        page?: number;
        limit?: number;
        role?: Role;
        unitId?: string;
        search?: string;
    }): Promise<{ users: UserDocument[]; total: number }> {
        const { page = 1, limit = 10, role, unitId, search } = options;

        const query: any = {};
        if (role) query.role = role;
        if (unitId) query.unitId = new Types.ObjectId(unitId);
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const [users, total] = await Promise.all([
            this.userModel
                .find(query)
                .select('-password')
                .populate('unitId', 'name code')
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 }),
            this.userModel.countDocuments(query),
        ]);

        return { users, total };
    }

    async findOne(id: string): Promise<UserDocument> {
        const user = await this.userModel
            .findById(id)
            .select('-password')
            .populate('unitId', 'name code');

        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
        }

        const user = await this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true })
            .select('-password');

        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async remove(id: string): Promise<void> {
        const result = await this.userModel.findByIdAndDelete(id);
        if (!result) {
            throw new NotFoundException('User not found');
        }
    }

    async updateTrustScore(userId: string, delta: number): Promise<UserDocument> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.trustScore = Math.max(0, Math.min(100, user.trustScore + delta));
        await user.save();
        return user;
    }

    async deactivate(id: string): Promise<UserDocument> {
        return this.update(id, { isActive: false } as UpdateUserDto);
    }

    async activate(id: string): Promise<UserDocument> {
        return this.update(id, { isActive: true } as UpdateUserDto);
    }
}
