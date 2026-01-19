import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get models
    const userModel = app.get(getModelToken('User')) as Model<any>;
    const unitModel = app.get(getModelToken('Unit')) as Model<any>;
    const courseModel = app.get(getModelToken('Course')) as Model<any>;
    const examModel = app.get(getModelToken('Exam')) as Model<any>;

    console.log('🌱 Seeding database...');

    // Clear existing data
    await userModel.deleteMany({});
    await unitModel.deleteMany({});
    await courseModel.deleteMany({});
    await examModel.deleteMany({});

    // Create Units
    console.log('📁 Creating units...');
    const mainUnit = await unitModel.create({
        name: 'Học viện Quân sự',
        code: 'HVQS',
        description: 'Học viện Quân sự Quốc gia',
        level: 0,
    });

    const unit1 = await unitModel.create({
        name: 'Khoa Chiến thuật',
        code: 'KCT',
        parentId: mainUnit._id,
        level: 1,
    });

    const unit2 = await unitModel.create({
        name: 'Khoa Kỹ thuật',
        code: 'KKT',
        parentId: mainUnit._id,
        level: 1,
    });

    // Create Users
    console.log('👤 Creating users...');
    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    const admin = await userModel.create({
        email: 'admin@military.edu.vn',
        password: hashedPassword,
        fullName: 'Quản trị viên',
        role: 'ADMIN',
        unitId: mainUnit._id,
        trustScore: 100,
        isActive: true,
    });

    const teacher = await userModel.create({
        email: 'teacher@military.edu.vn',
        password: hashedPassword,
        fullName: 'Nguyễn Văn Giảng',
        role: 'TEACHER',
        unitId: unit1._id,
        trustScore: 100,
        militaryId: 'GV-2024-001',
        rank: 'Đại úy',
        isActive: true,
    });

    const student1 = await userModel.create({
        email: 'student1@military.edu.vn',
        password: hashedPassword,
        fullName: 'Trần Văn An',
        role: 'STUDENT',
        unitId: unit1._id,
        trustScore: 95,
        militaryId: 'HV-2024-001',
        rank: 'Thiếu úy',
        isActive: true,
    });

    const student2 = await userModel.create({
        email: 'student2@military.edu.vn',
        password: hashedPassword,
        fullName: 'Lê Thị Bình',
        role: 'STUDENT',
        unitId: unit2._id,
        trustScore: 88,
        militaryId: 'HV-2024-002',
        rank: 'Thiếu úy',
        isActive: true,
    });

    // Create Courses
    console.log('📚 Creating courses...');
    const course1 = await courseModel.create({
        title: 'Chiến thuật quân sự cơ bản',
        description: 'Khóa học về các nguyên tắc chiến thuật căn bản trong tác chiến hiện đại',
        instructorId: teacher._id,
        isPublished: true,
        totalLessons: 12,
        totalDuration: 360,
        tags: ['chiến thuật', 'cơ bản', 'tác chiến'],
        chapters: [
            {
                title: 'Giới thiệu chiến thuật',
                description: 'Tổng quan về chiến thuật quân sự',
                position: 1,
                lessons: [
                    { title: 'Lịch sử chiến thuật quân sự', type: 'VIDEO', duration: 30, position: 1, isPublished: true },
                    { title: 'Nguyên tắc cơ bản', type: 'DOCUMENT', duration: 20, position: 2, isPublished: true },
                ],
            },
            {
                title: 'Chiến thuật phòng ngự',
                description: 'Các phương pháp phòng ngự hiệu quả',
                position: 2,
                lessons: [
                    { title: 'Phòng ngự vị trí', type: 'VIDEO', duration: 45, position: 1, isPublished: true },
                    { title: 'Phòng ngự cơ động', type: 'VIDEO', duration: 40, position: 2, isPublished: true },
                ],
            },
        ],
    });

    const course2 = await courseModel.create({
        title: 'Kỹ thuật thông tin liên lạc',
        description: 'Đào tạo về các thiết bị và phương thức thông tin liên lạc quân sự',
        instructorId: teacher._id,
        isPublished: true,
        totalLessons: 8,
        totalDuration: 240,
        tags: ['thông tin', 'liên lạc', 'kỹ thuật'],
        chapters: [
            {
                title: 'Thiết bị vô tuyến',
                position: 1,
                lessons: [
                    { title: 'Máy bộ đàm cầm tay', type: 'VIDEO', duration: 30, position: 1, isPublished: true },
                    { title: 'Hệ thống vô tuyến', type: 'VIDEO', duration: 35, position: 2, isPublished: true },
                ],
            },
        ],
    });

    // Create Exams
    console.log('📝 Creating exams...');
    await examModel.create({
        courseId: course1._id,
        title: 'Kiểm tra giữa kỳ - Chiến thuật cơ bản',
        description: 'Bài kiểm tra đánh giá kiến thức giữa kỳ',
        duration: 45,
        totalPoints: 100,
        passScore: 60,
        shuffleQuestions: true,
        shuffleOptions: true,
        maxAttempts: 2,
        isPublished: true,
        requireProctoring: true,
        questions: [
            {
                type: 'MULTIPLE_CHOICE',
                content: 'Nguyên tắc quan trọng nhất trong chiến thuật phòng ngự là gì?',
                options: ['Tập trung lực lượng', 'Phân tán lực lượng', 'Kiên quyết giữ vững trận địa', 'Di chuyển liên tục'],
                correctAnswer: 'Kiên quyết giữ vững trận địa',
                points: 10,
                difficulty: 'MEDIUM',
            },
            {
                type: 'TRUE_FALSE',
                content: 'Phòng ngự cơ động hiệu quả hơn phòng ngự vị trí trong mọi tình huống.',
                options: ['Đúng', 'Sai'],
                correctAnswer: 'Sai',
                points: 10,
                difficulty: 'EASY',
            },
            {
                type: 'MULTIPLE_CHOICE',
                content: 'Yếu tố nào quan trọng nhất khi lựa chọn địa hình phòng ngự?',
                options: ['Độ cao', 'Tầm quan sát', 'Nguồn nước', 'Khoảng cách đến hậu phương'],
                correctAnswer: 'Tầm quan sát',
                points: 10,
                difficulty: 'MEDIUM',
            },
        ],
    });

    console.log('✅ Seeding completed!');
    console.log('');
    console.log('📋 Created data:');
    console.log(`   - ${await unitModel.countDocuments()} units`);
    console.log(`   - ${await userModel.countDocuments()} users`);
    console.log(`   - ${await courseModel.countDocuments()} courses`);
    console.log(`   - ${await examModel.countDocuments()} exams`);
    console.log('');
    console.log('🔐 Login credentials:');
    console.log('   Admin:   admin@military.edu.vn / Admin@123');
    console.log('   Teacher: teacher@military.edu.vn / Admin@123');
    console.log('   Student: student1@military.edu.vn / Admin@123');

    await app.close();
}

seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
