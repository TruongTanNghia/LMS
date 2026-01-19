import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exam, ExamDocument } from '../../schemas/exam.schema';
import { ExamAttempt, ExamAttemptDocument, ViolationType } from '../../schemas/exam-attempt.schema';
import { UsersService } from '../users/users.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { SubmitExamDto } from './dto/submit-exam.dto';

@Injectable()
export class ExamsService {
    constructor(
        @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
        @InjectModel(ExamAttempt.name) private attemptModel: Model<ExamAttemptDocument>,
        private usersService: UsersService,
    ) { }

    async create(createExamDto: CreateExamDto): Promise<ExamDocument> {
        // Calculate total points
        const totalPoints = createExamDto.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;
        return this.examModel.create({ ...createExamDto, totalPoints });
    }

    async findAll(options: { courseId?: string; published?: boolean }): Promise<ExamDocument[]> {
        const query: any = {};
        if (options.courseId) query.courseId = new Types.ObjectId(options.courseId);
        if (options.published !== undefined) query.isPublished = options.published;
        return this.examModel.find(query).populate('courseId', 'title');
    }

    async findOne(id: string): Promise<ExamDocument> {
        const exam = await this.examModel.findById(id).populate('courseId', 'title');
        if (!exam) throw new NotFoundException('Exam not found');
        return exam;
    }

    async update(id: string, updateExamDto: UpdateExamDto): Promise<ExamDocument> {
        if (updateExamDto.questions) {
            (updateExamDto as any).totalPoints = updateExamDto.questions.reduce((sum, q) => sum + (q.points || 1), 0);
        }
        const exam = await this.examModel.findByIdAndUpdate(id, updateExamDto, { new: true });
        if (!exam) throw new NotFoundException('Exam not found');
        return exam;
    }

    async remove(id: string): Promise<void> {
        const result = await this.examModel.findByIdAndDelete(id);
        if (!result) throw new NotFoundException('Exam not found');
    }

    // Exam Attempts
    async startExam(examId: string, userId: string, ipAddress?: string, userAgent?: string): Promise<ExamAttemptDocument> {
        const exam = await this.findOne(examId);

        // Check time window
        const now = new Date();
        if (exam.startTime && now < exam.startTime) {
            throw new BadRequestException('Exam has not started yet');
        }
        if (exam.endTime && now > exam.endTime) {
            throw new BadRequestException('Exam has ended');
        }

        // Check attempt limit
        const existingAttempts = await this.attemptModel.countDocuments({
            examId: new Types.ObjectId(examId),
            userId: new Types.ObjectId(userId),
        });
        if (existingAttempts >= exam.maxAttempts) {
            throw new BadRequestException('Maximum attempts reached');
        }

        // Check for in-progress attempt
        const inProgress = await this.attemptModel.findOne({
            examId: new Types.ObjectId(examId),
            userId: new Types.ObjectId(userId),
            status: 'IN_PROGRESS',
        });
        if (inProgress) return inProgress;

        // Shuffle questions if needed
        let questionOrder = exam.questions.map((_, i) => i);
        if (exam.shuffleQuestions) {
            questionOrder = this.shuffle(questionOrder);
        }

        return this.attemptModel.create({
            examId: new Types.ObjectId(examId),
            userId: new Types.ObjectId(userId),
            questionOrder,
            ipAddress,
            userAgent,
            status: 'IN_PROGRESS',
        });
    }

    async submitExam(attemptId: string, submitDto: SubmitExamDto, userId: string): Promise<ExamAttemptDocument> {
        const attempt = await this.attemptModel.findById(attemptId);
        if (!attempt) throw new NotFoundException('Attempt not found');
        if (attempt.userId.toString() !== userId) throw new ForbiddenException();
        if (attempt.status !== 'IN_PROGRESS') throw new BadRequestException('Exam already submitted');

        const exam = await this.findOne(attempt.examId.toString());

        // Grade multiple choice questions
        let score = 0;
        const gradedAnswers = submitDto.answers.map(ans => {
            const question = exam.questions[ans.questionIndex];
            if (!question) return { ...ans, isCorrect: false, points: 0 };

            // Auto-grade multiple choice
            if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
                const isCorrect = ans.answer === question.correctAnswer;
                const points = isCorrect ? question.points : 0;
                if (isCorrect) score += question.points;
                return { ...ans, isCorrect, points };
            }

            // Essay needs manual review
            return { ...ans, isCorrect: false, points: 0 };
        });

        const isPassed = score >= exam.passScore;

        // Update trust score
        if (isPassed) {
            await this.usersService.updateTrustScore(userId, 5);
        }

        attempt.answers = gradedAnswers;
        attempt.score = score;
        attempt.isPassed = isPassed;
        attempt.submittedAt = new Date();
        attempt.status = 'SUBMITTED';

        return attempt.save();
    }

    async addViolation(attemptId: string, violationType: ViolationType, screenshot?: string, confidence?: number): Promise<ExamAttemptDocument> {
        const attempt = await this.attemptModel.findById(attemptId);
        if (!attempt) throw new NotFoundException('Attempt not found');

        attempt.violations.push({
            type: violationType,
            timestamp: new Date(),
            screenshot,
            confidence,
            reviewed: false,
        } as any);

        // Update trust score based on violation
        const trustDelta = this.getTrustDelta(violationType);
        await this.usersService.updateTrustScore(attempt.userId.toString(), trustDelta);

        return attempt.save();
    }

    async getAttempts(examId: string, userId?: string): Promise<ExamAttemptDocument[]> {
        const query: any = { examId: new Types.ObjectId(examId) };
        if (userId) query.userId = new Types.ObjectId(userId);
        return this.attemptModel.find(query).populate('userId', 'fullName email');
    }

    private shuffle<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    private getTrustDelta(type: ViolationType): number {
        const deltas: Record<ViolationType, number> = {
            [ViolationType.FACE_NOT_DETECTED]: -3,
            [ViolationType.MULTIPLE_FACES]: -10,
            [ViolationType.LOOKING_AWAY]: -1,
            [ViolationType.TAB_SWITCH]: -2,
            [ViolationType.FULLSCREEN_EXIT]: -2,
            [ViolationType.PHONE_DETECTED]: -5,
            [ViolationType.AUDIO_ANOMALY]: -1,
        };
        return deltas[type] || -1;
    }
}
