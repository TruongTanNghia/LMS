import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const UserModel = app.get(getModelToken('User'));
    const UnitModel = app.get(getModelToken('Unit'));
    const CourseModel = app.get(getModelToken('Course'));
    const ExamModel = app.get(getModelToken('Exam'));

    console.log('🗑️  Clearing old data...');
    await UserModel.deleteMany({});
    await UnitModel.deleteMany({});
    await CourseModel.deleteMany({});
    await ExamModel.deleteMany({});

    // ============================================
    // ĐƠN VỊ NHÀ TRƯỜNG (Academic/Administrative)
    // ============================================
    console.log('🏫 Creating school organization units...');

    // 1. NHÀ TRƯỜNG (Root)
    const school = await UnitModel.create({
        name: 'Học viện Quân sự',
        code: 'HVQS',
        description: 'Học viện Quân sự Quốc gia',
        type: 'SCHOOL',
        category: 'ACADEMIC',
        level: 0,
        order: 1,
    });

    // 2. KHOA (9 khoa)
    console.log('   📚 Creating Faculties (Khoa)...');
    const facultyData = [
        { name: 'Khoa Công nghệ Thông tin', code: 'K-CNTT', order: 1 },
        { name: 'Khoa Điện tử Viễn thông', code: 'K-DTVT', order: 2 },
        { name: 'Khoa Cơ khí', code: 'K-CK', order: 3 },
        { name: 'Khoa Xây dựng', code: 'K-XD', order: 4 },
        { name: 'Khoa Khoa học Quân sự', code: 'K-KHQS', order: 5 },
        { name: 'Khoa Ngoại ngữ', code: 'K-NN', order: 6 },
        { name: 'Khoa Lý luận Chính trị', code: 'K-LLCT', order: 7 },
        { name: 'Khoa Giáo dục Thể chất', code: 'K-GDTC', order: 8 },
        { name: 'Khoa Khoa học Cơ bản', code: 'K-KHCB', order: 9 },
    ];

    const faculties: any[] = [];
    for (const f of facultyData) {
        const faculty = await UnitModel.create({
            ...f,
            type: 'FACULTY',
            category: 'ACADEMIC',
            parentId: school._id,
            level: 1,
        });
        faculties.push(faculty);
    }

    // 3. BỘ MÔN (thuộc Khoa CNTT)
    console.log('   📖 Creating Departments (Bộ môn)...');
    const cnttDepts = [
        { name: 'Bộ môn Mạng máy tính', code: 'BM-MMT', order: 1 },
        { name: 'Bộ môn Kỹ thuật Phần mềm', code: 'BM-KTPM', order: 2 },
        { name: 'Bộ môn Trí tuệ Nhân tạo', code: 'BM-AI', order: 3 },
        { name: 'Bộ môn An toàn Thông tin', code: 'BM-ATTT', order: 4 },
    ];

    for (const d of cnttDepts) {
        await UnitModel.create({
            ...d,
            type: 'DEPARTMENT',
            category: 'ACADEMIC',
            parentId: faculties[0]._id,
            level: 2,
        });
    }

    // 4. PHÒNG (4 phòng)
    console.log('   🏢 Creating Offices (Phòng)...');
    const offices = [
        { name: 'Phòng Đào tạo', code: 'P-DT', order: 1 },
        { name: 'Phòng Chính trị', code: 'P-CT', order: 2 },
        { name: 'Phòng Hậu cần', code: 'P-HC', order: 3 },
        { name: 'Phòng Khoa học', code: 'P-KH', order: 4 },
    ];

    for (const o of offices) {
        await UnitModel.create({
            ...o,
            type: 'OFFICE',
            category: 'ADMINISTRATIVE',
            parentId: school._id,
            level: 1,
        });
    }

    // 5. BAN (3 ban)
    console.log('   📋 Creating Divisions (Ban)...');
    const divisions = [
        { name: 'Ban Tham mưu', code: 'BAN-TM', order: 1 },
        { name: 'Ban Tài chính', code: 'BAN-TC', order: 2 },
        { name: 'Ban Quản lý Học viên', code: 'BAN-QLHV', order: 3 },
    ];

    for (const d of divisions) {
        await UnitModel.create({
            ...d,
            type: 'DIVISION',
            category: 'ADMINISTRATIVE',
            parentId: school._id,
            level: 1,
        });
    }

    // ============================================
    // ĐƠN VỊ HỌC VIÊN (Military Training Units)
    // Tiểu đoàn → Đại đội → Lớp
    // ============================================
    console.log('🎖️  Creating student military units...');

    // TIỂU ĐOÀN (2)
    const battalionData = [
        { name: 'Tiểu đoàn 1', code: 'TD1', description: 'Tiểu đoàn học viên năm 1-2', order: 1 },
        { name: 'Tiểu đoàn 2', code: 'TD2', description: 'Tiểu đoàn học viên năm 3-4', order: 2 },
    ];

    for (const b of battalionData) {
        const battalion = await UnitModel.create({
            ...b,
            type: 'BATTALION',
            category: 'MILITARY',
            parentId: school._id,
            level: 1,
        });

        // ĐẠI ĐỘI (3 per battalion)
        for (let i = 1; i <= 3; i++) {
            const company = await UnitModel.create({
                name: `Đại đội ${i}`,
                code: `${b.code}-DD${i}`,
                description: `Đại đội ${i} thuộc ${b.name}`,
                type: 'COMPANY',
                category: 'MILITARY',
                parentId: battalion._id,
                level: 2,
                order: i,
            });

            // LỚP (2 per company)
            for (let j = 1; j <= 2; j++) {
                await UnitModel.create({
                    name: `Lớp CT${i}${j}`,
                    code: `${b.code}-DD${i}-CT${j}`,
                    description: `Lớp Công nghệ ${i}${j}`,
                    type: 'CLASS',
                    category: 'MILITARY',
                    parentId: company._id,
                    level: 3,
                    order: j,
                });
            }
        }
    }

    // ========== USERS ==========
    console.log('👥 Creating users...');
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    const firstClass = await UnitModel.findOne({ type: 'CLASS' });
    const firstFaculty = faculties[0];

    await UserModel.create({
        email: 'admin@military.edu.vn',
        password: passwordHash,
        fullName: 'Quản trị viên',
        role: 'ADMIN',
        unitId: school._id,
        trustScore: 100,
        isActive: true,
    });

    const teacher = await UserModel.create({
        email: 'teacher@military.edu.vn',
        password: passwordHash,
        fullName: 'Nguyễn Văn Thầy',
        role: 'TEACHER',
        unitId: firstFaculty._id,
        militaryId: 'GV-2024-001',
        rank: 'Thiếu tá',
        trustScore: 100,
        isActive: true,
    });

    for (let i = 1; i <= 3; i++) {
        await UserModel.create({
            email: `student${i}@military.edu.vn`,
            password: passwordHash,
            fullName: `Học viên ${i}`,
            role: 'STUDENT',
            unitId: firstClass?._id,
            militaryId: `HV-2024-00${i}`,
            rank: 'Trung sĩ',
            trustScore: 100 - (i * 5),
            isActive: true,
        });
    }

    // ========== COURSES ==========
    console.log('📚 Creating courses...');
    const course1 = await CourseModel.create({
        title: 'An toàn Thông tin Quân sự',
        description: 'Khóa học về bảo mật trong môi trường quân đội',
        instructorId: teacher._id,
        tags: ['security', 'military'],
        isPublished: true,
        chapters: [
            {
                title: 'Chương 1: Tổng quan ATTT',
                position: 1,
                lessons: [
                    { title: 'Bài 1.1: Khái niệm', type: 'VIDEO', duration: 45, position: 1 },
                    { title: 'Bài 1.2: Mối đe dọa', type: 'VIDEO', duration: 60, position: 2 },
                ],
            },
        ],
    });

    // ========== EXAMS ==========
    console.log('📝 Creating exams...');
    await ExamModel.create({
        title: 'Kiểm tra ATTT - Giữa kỳ',
        description: 'Bài kiểm tra giữa kỳ',
        courseId: course1._id,
        duration: 60,
        totalPoints: 100,
        passScore: 50,  // Fixed: use passScore not passingScore
        maxAttempts: 2,
        isPublished: true,
        shuffleQuestions: true,
        requireProctoring: true,
        questions: [
            {
                type: 'MULTIPLE_CHOICE',
                content: 'CIA trong ATTT là viết tắt của?',  // Fixed: use content not question
                options: [
                    'Confidentiality, Integrity, Availability',
                    'Computer, Internet, Application',
                ],
                correctAnswer: 'Confidentiality, Integrity, Availability',
                points: 10,
                difficulty: 'MEDIUM',
            },
            {
                type: 'TRUE_FALSE',
                content: 'AES là thuật toán mã hóa đối xứng',
                options: ['true', 'false'],
                correctAnswer: 'true',
                points: 10,
                difficulty: 'EASY',
            },
        ],
    });

    // ========== SUMMARY ==========
    const unitCount = await UnitModel.countDocuments();
    const academicCount = await UnitModel.countDocuments({ category: 'ACADEMIC' });
    const adminCount = await UnitModel.countDocuments({ category: 'ADMINISTRATIVE' });
    const militaryCount = await UnitModel.countDocuments({ category: 'MILITARY' });

    console.log('');
    console.log('✅ Seed completed!');
    console.log('=====================================');
    console.log(`📊 Units: ${unitCount} total`);
    console.log(`   🏫 Academic: ${academicCount} (Trường/Khoa/Bộ môn)`);
    console.log(`   🏢 Administrative: ${adminCount} (Phòng/Ban)`);
    console.log(`   🎖️  Military: ${militaryCount} (Tiểu đoàn/Đại đội/Lớp)`);
    console.log('=====================================');
    console.log('');
    console.log('🔑 Login: admin@military.edu.vn / Admin@123');

    await app.close();
}

seed().catch(err => {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
});
