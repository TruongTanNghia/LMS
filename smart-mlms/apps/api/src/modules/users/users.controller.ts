import {
    Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../schemas/user.schema';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Create a new user (Admin only)' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Get all users with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'role', required: false, enum: Role })
    @ApiQuery({ name: 'unitId', required: false, type: String })
    @ApiQuery({ name: 'search', required: false, type: String })
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('role') role?: Role,
        @Query('unitId') unitId?: string,
        @Query('search') search?: string,
    ) {
        return this.usersService.findAll({ page, limit, role, unitId, search });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Update user (Admin only)' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete user (Admin only)' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @Patch(':id/deactivate')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Deactivate user' })
    deactivate(@Param('id') id: string) {
        return this.usersService.deactivate(id);
    }

    @Patch(':id/activate')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Activate user' })
    activate(@Param('id') id: string) {
        return this.usersService.activate(id);
    }
}
