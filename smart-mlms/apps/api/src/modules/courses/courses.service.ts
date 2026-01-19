import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from '../../schemas/course.schema';
import { LessonProgress, LessonProgressDocument } from '../../schemas/lesson-progress.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
    constructor(
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(LessonProgress.name) private progressModel: Model<LessonProgressDocument>,
    ) { }

    async create(createCourseDto: CreateCourseDto, instructorId: string): Promise<CourseDocument> {
        return this.courseModel.create({
            ...createCourseDto,
            instructorId: new Types.ObjectId(instructorId),
        });
    }

    async findAll(options: { page?: number; limit?: number; search?: string; published?: boolean }): Promise<{ courses: CourseDocument[]; total: number }> {
        const { page = 1, limit = 10, search, published } = options;
        const query: any = {};

        if (search) {
            query.$text = { $search: search };
        }
        if (published !== undefined) {
            query.isPublished = published;
        }

        const [courses, total] = await Promise.all([
            this.courseModel
                .find(query)
                .populate('instructorId', 'fullName email')
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 }),
            this.courseModel.countDocuments(query),
        ]);

        return { courses, total };
    }

    async findOne(id: string): Promise<CourseDocument> {
        const course = await this.courseModel
            .findById(id)
            .populate('instructorId', 'fullName email');

        if (!course) throw new NotFoundException('Course not found');
        return course;
    }

    async update(id: string, updateCourseDto: UpdateCourseDto): Promise<CourseDocument> {
        // Recalculate totals
        if (updateCourseDto.chapters) {
            let totalLessons = 0;
            let totalDuration = 0;
            updateCourseDto.chapters.forEach(ch => {
                if (ch.lessons) {
                    totalLessons += ch.lessons.length;
                    ch.lessons.forEach(l => { totalDuration += l.duration || 0; });
                }
            });
            (updateCourseDto as any).totalLessons = totalLessons;
            (updateCourseDto as any).totalDuration = totalDuration;
        }

        const course = await this.courseModel.findByIdAndUpdate(id, updateCourseDto, { new: true });
        if (!course) throw new NotFoundException('Course not found');
        return course;
    }

    async remove(id: string): Promise<void> {
        const result = await this.courseModel.findByIdAndDelete(id);
        if (!result) throw new NotFoundException('Course not found');
    }

    async publish(id: string): Promise<CourseDocument> {
        return this.update(id, { isPublished: true } as UpdateCourseDto);
    }

    async unpublish(id: string): Promise<CourseDocument> {
        return this.update(id, { isPublished: false } as UpdateCourseDto);
    }

    // Progress tracking
    async updateProgress(userId: string, courseId: string, chapterIndex: number, lessonIndex: number, progress: number): Promise<LessonProgressDocument> {
        const update = {
            progress,
            lastAccessedAt: new Date(),
            isCompleted: progress >= 100,
            completedAt: progress >= 100 ? new Date() : undefined,
        };

        return this.progressModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId), courseId: new Types.ObjectId(courseId), chapterIndex, lessonIndex },
            { $set: update },
            { upsert: true, new: true },
        );
    }

    async getProgress(userId: string, courseId: string): Promise<LessonProgressDocument[]> {
        return this.progressModel.find({
            userId: new Types.ObjectId(userId),
            courseId: new Types.ObjectId(courseId),
        });
    }
}
