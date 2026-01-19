import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../schemas/user.schema';

@ApiTags('Units')
@Controller('units')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UnitsController {
    constructor(private readonly unitsService: UnitsService) { }

    @Post()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Create a new unit' })
    create(@Body() createUnitDto: CreateUnitDto) {
        return this.unitsService.create(createUnitDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all units' })
    findAll() {
        return this.unitsService.findAll();
    }

    @Get('tree')
    @ApiOperation({ summary: 'Get units as tree structure' })
    findTree() {
        return this.unitsService.findTree();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get unit by ID' })
    findOne(@Param('id') id: string) {
        return this.unitsService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Update unit' })
    update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
        return this.unitsService.update(id, updateUnitDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete unit' })
    remove(@Param('id') id: string) {
        return this.unitsService.remove(id);
    }
}
