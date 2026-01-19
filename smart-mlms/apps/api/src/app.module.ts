import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { UnitsModule } from './modules/units/units.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ExamsModule } from './modules/exams/exams.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
    imports: [
        // Config
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '../../.env',
        }),

        // MongoDB
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI'),
            }),
            inject: [ConfigService],
        }),

        // Feature modules
        AuthModule,
        UsersModule,
        UnitsModule,
        CoursesModule,
        ExamsModule,
        AuditModule,
    ],
})
export class AppModule { }
