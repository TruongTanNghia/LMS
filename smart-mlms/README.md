# 🎖️ Smart MLMS - Hệ thống Đào tạo Quân sự Thông minh

> **Military Learning Management System** - Nền tảng học tập và thi cử với AI Proctoring

[![NestJS](https://img.shields.io/badge/Backend-NestJS-red?logo=nestjs)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?logo=mongodb)](https://mongodb.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript)](https://typescriptlang.org/)

---

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Công nghệ](#-công-nghệ)
- [Cài đặt](#-cài-đặt)
- [Chạy dự án](#-chạy-dự-án)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [API Documentation](#-api-documentation)
- [Tài khoản Demo](#-tài-khoản-demo)

---

## ✨ Tính năng

### 🔐 Xác thực & Phân quyền
- JWT Authentication
- 3 vai trò: **Admin**, **Giảng viên**, **Học viên**
- Trust Score - Điểm tin cậy của người dùng

### 📚 Quản lý Khóa học
- CRUD khóa học với chapters/lessons
- Hỗ trợ nhiều loại bài học: Video, Tài liệu, Slide, Văn bản
- Theo dõi tiến độ học tập

### 📝 Hệ thống Thi cử
- Tạo bài thi với nhiều loại câu hỏi (Trắc nghiệm, Đúng/Sai)
- Chấm điểm tự động
- Timer và Navigation câu hỏi

### 🎥 AI Proctoring (UI Ready)
- Camera preview khi thi
- Phát hiện chuyển tab
- Ghi nhận vi phạm

### 🏢 Quản lý Đơn vị
- Cấu trúc cây phân cấp (Học viện → Khoa → Bộ môn)
- CRUD với parent-child relationship

### 📊 Báo cáo & Thống kê
- Dashboard tổng quan
- Charts & Analytics (Recharts)
- Thống kê vi phạm thi cử

---

## 🛠 Công nghệ

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TailwindCSS, Framer Motion |
| **Backend** | NestJS 10, Mongoose, Passport JWT |
| **Database** | MongoDB |
| **State** | Zustand (with persist) |
| **Validation** | Zod (FE), class-validator (BE) |
| **Build** | Turborepo |

---

## 📦 Cài đặt

### Yêu cầu
- Node.js >= 18
- MongoDB (local hoặc Atlas)
- npm hoặc pnpm

### Clone & Install

```bash
# Clone repository
git clone https://github.com/TruongTanNghia/LMS.git
cd LMS/smart-mlms

# Install dependencies
npm install

# Install backend dependencies
cd apps/api && npm install && cd ../..

# Install frontend dependencies
cd apps/web && npm install && cd ../..
```

### Cấu hình môi trường

```bash
# Copy file .env mẫu
cp .env.example .env

# Chỉnh sửa .env với thông tin của bạn
```

**.env** file:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/smart_mlms

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRATION=7d

# Port
API_PORT=3001
```

### Seed dữ liệu mẫu

```bash
cd apps/api
npx ts-node src/seed.ts
```

---

## 🚀 Chạy dự án

### Development

```bash
# Terminal 1 - Backend API
cd apps/api
npm run start:dev
# hoặc
nest start --watch

# Terminal 2 - Frontend Web
cd apps/web
npm run dev
```

### URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs

---

## 📁 Cấu trúc thư mục

```
smart-mlms/
├── apps/
│   ├── api/                      # NestJS Backend
│   │   └── src/
│   │       ├── modules/          # Feature modules
│   │       │   ├── auth/         # Authentication
│   │       │   ├── users/        # Users CRUD
│   │       │   ├── units/        # Units hierarchy
│   │       │   ├── courses/      # Courses management
│   │       │   ├── exams/        # Exams & proctoring
│   │       │   └── audit/        # Audit logging
│   │       ├── schemas/          # Mongoose schemas
│   │       ├── main.ts           # Entry point
│   │       └── seed.ts           # Database seeder
│   │
│   └── web/                      # Next.js Frontend
│       └── src/
│           ├── app/              # App Router pages
│           │   ├── dashboard/    # Protected pages
│           │   └── login/        # Public pages
│           └── lib/              # Utilities
│               ├── api.ts        # API client (axios)
│               └── store/        # Zustand stores
│
├── docker-compose.yml            # Docker setup
├── turbo.json                    # Turborepo config
└── README.md
```

---

## 📖 API Documentation

Swagger UI khả dụng tại: http://localhost:3001/api/docs

### Endpoints chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/auth/login` | Đăng nhập |
| `POST` | `/api/auth/register` | Đăng ký |
| `GET` | `/api/users` | Danh sách người dùng |
| `GET` | `/api/units` | Danh sách đơn vị |
| `GET` | `/api/courses` | Danh sách khóa học |
| `GET` | `/api/exams` | Danh sách bài thi |
| `POST` | `/api/exams/:id/start` | Bắt đầu làm bài |
| `POST` | `/api/exams/attempts/:id/submit` | Nộp bài |

---

## 👤 Tài khoản Demo

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | admin@military.edu.vn | Admin@123 |
| Giảng viên | teacher@military.edu.vn | Admin@123 |
| Học viên | student1@military.edu.vn | Admin@123 |

---

## 📝 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 👨‍💻 Tác giả

**Trương Tấn Nghĩa**

---

<p align="center">
  Made with ❤️ for Military Education
</p>
