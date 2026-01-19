import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../schemas/user.schema';

@ApiTags('Courses')
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Post()
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Create a new course' })
    create(@Body() createCourseDto: CreateCourseDto, @Request() req: any) {
        return this.coursesService.create(createCourseDto, req.user._id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all courses' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'published', required: false })
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('published') published?: boolean,
    ) {
        return this.coursesService.findAll({ page, limit, search, published });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get course by ID' })
    findOne(@Param('id') id: string) {
        return this.coursesService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Update course' })
    update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
        return this.coursesService.update(id, updateCourseDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete course' })
    remove(@Param('id') id: string) {
        return this.coursesService.remove(id);
    }

    @Patch(':id/publish')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Publish course' })
    publish(@Param('id') id: string) {
        return this.coursesService.publish(id);
    }

    @Patch(':id/unpublish')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Unpublish course' })
    unpublish(@Param('id') id: string) {
        return this.coursesService.unpublish(id);
    }

    @Get(':id/progress')
    @ApiOperation({ summary: 'Get my progress for a course' })
    getProgress(@Param('id') id: string, @Request() req: any) {
        return this.coursesService.getProgress(req.user._id, id);
    }

    @Post(':id/progress')
    @ApiOperation({ summary: 'Update lesson progress' })
    updateProgress(
        @Param('id') id: string,
        @Body() body: { chapterIndex: number; lessonIndex: number; progress: number },
        @Request() req: any,
    ) {
        return this.coursesService.updateProgress(
            req.user._id,
            id,
            body.chapterIndex,
            body.lessonIndex,
            body.progress,
        );
    }
}
