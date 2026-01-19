import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, Ip, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { SubmitExamDto } from './dto/submit-exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../schemas/user.schema';
import { ViolationType } from '../../schemas/exam-attempt.schema';

@ApiTags('Exams')
@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExamsController {
    constructor(private readonly examsService: ExamsService) { }

    @Post()
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Create a new exam' })
    create(@Body() createExamDto: CreateExamDto) {
        return this.examsService.create(createExamDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all exams' })
    @ApiQuery({ name: 'courseId', required: false })
    @ApiQuery({ name: 'published', required: false })
    findAll(
        @Query('courseId') courseId?: string,
        @Query('published') published?: boolean,
    ) {
        return this.examsService.findAll({ courseId, published });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get exam by ID' })
    findOne(@Param('id') id: string) {
        return this.examsService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Update exam' })
    update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
        return this.examsService.update(id, updateExamDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Delete exam' })
    remove(@Param('id') id: string) {
        return this.examsService.remove(id);
    }

    // Exam Attempts
    @Post(':id/start')
    @ApiOperation({ summary: 'Start an exam attempt' })
    startExam(
        @Param('id') id: string,
        @Request() req: any,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
    ) {
        return this.examsService.startExam(id, req.user._id, ip, userAgent);
    }

    @Post('attempts/:attemptId/submit')
    @ApiOperation({ summary: 'Submit exam answers' })
    submitExam(
        @Param('attemptId') attemptId: string,
        @Body() submitDto: SubmitExamDto,
        @Request() req: any,
    ) {
        return this.examsService.submitExam(attemptId, submitDto, req.user._id);
    }

    @Post('attempts/:attemptId/violation')
    @ApiOperation({ summary: 'Report a proctoring violation' })
    addViolation(
        @Param('attemptId') attemptId: string,
        @Body() body: { type: ViolationType; screenshot?: string; confidence?: number },
    ) {
        return this.examsService.addViolation(attemptId, body.type, body.screenshot, body.confidence);
    }

    @Get(':id/attempts')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Get all attempts for an exam' })
    getAttempts(@Param('id') id: string, @Query('userId') userId?: string) {
        return this.examsService.getAttempts(id, userId);
    }
}
