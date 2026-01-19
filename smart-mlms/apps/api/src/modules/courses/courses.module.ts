import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course, CourseSchema } from '../../schemas/course.schema';
import { LessonProgress, LessonProgressSchema } from '../../schemas/lesson-progress.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Course.name, schema: CourseSchema },
            { name: LessonProgress.name, schema: LessonProgressSchema },
        ]),
    ],
    controllers: [CoursesController],
    providers: [CoursesService],
    exports: [CoursesService],
})
export class CoursesModule { }
