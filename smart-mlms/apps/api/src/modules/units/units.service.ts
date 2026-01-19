import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Unit, UnitDocument } from '../../schemas/unit.schema';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
    constructor(
        @InjectModel(Unit.name) private unitModel: Model<UnitDocument>,
    ) { }

    async create(createUnitDto: CreateUnitDto): Promise<UnitDocument> {
        let level = 0;
        if (createUnitDto.parentId) {
            const parent = await this.unitModel.findById(createUnitDto.parentId);
            if (parent) level = parent.level + 1;
        }
        return this.unitModel.create({ ...createUnitDto, level });
    }

    async findAll(): Promise<UnitDocument[]> {
        return this.unitModel.find().sort({ level: 1, name: 1 });
    }

    async findTree(): Promise<any[]> {
        const units = await this.unitModel.find().lean();
        return this.buildTree(units);
    }

    private buildTree(units: any[], parentId: string | null = null): any[] {
        return units
            .filter(u => String(u.parentId || '') === String(parentId || ''))
            .map(unit => ({
                ...unit,
                children: this.buildTree(units, unit._id),
            }));
    }

    async findOne(id: string): Promise<UnitDocument> {
        const unit = await this.unitModel.findById(id);
        if (!unit) throw new NotFoundException('Unit not found');
        return unit;
    }

    async update(id: string, updateUnitDto: UpdateUnitDto): Promise<UnitDocument> {
        const unit = await this.unitModel.findByIdAndUpdate(id, updateUnitDto, { new: true });
        if (!unit) throw new NotFoundException('Unit not found');
        return unit;
    }

    async remove(id: string): Promise<void> {
        const result = await this.unitModel.findByIdAndDelete(id);
        if (!result) throw new NotFoundException('Unit not found');
    }
}
