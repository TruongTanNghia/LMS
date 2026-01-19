import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { Exam, ExamSchema } from '../../schemas/exam.schema';
import { ExamAttempt, ExamAttemptSchema } from '../../schemas/exam-attempt.schema';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Exam.name, schema: ExamSchema },
            { name: ExamAttempt.name, schema: ExamAttemptSchema },
        ]),
        UsersModule,
    ],
    controllers: [ExamsController],
    providers: [ExamsService],
    exports: [ExamsService],
})
export class ExamsModule { }
