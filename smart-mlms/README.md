# Smart MLMS - Military Learning Management System

> 🎖️ Hệ thống Đào tạo Quân sự Thông minh với AI Proctoring, Learning Analytics, Trust Score

## 📋 Tổng quan

Smart MLMS là nền tảng đào tạo thế hệ mới dành cho môi trường quân sự, kết hợp:
- **LMS Core**: Quản lý khóa học, học liệu, tiến độ học tập
- **Exam System**: Ngân hàng câu hỏi, sinh đề ngẫu nhiên, chấm tự động
- **AI Proctoring**: Giám sát thi real-time, phát hiện gian lận
- **Trust Score**: Hệ thống điểm tín nhiệm cho học viên

## 🏗️ Kiến trúc

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   NestJS        │    │   FastAPI       │
│   Frontend      │───▶│   Core API      │───▶│   AI Engine     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                       │
                       ┌──────┴───────────────────────┴──────┐
                       │              MongoDB                 │
                       └──────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- Docker & Docker Compose
- Git

### 1. Clone & Install

```bash
git clone <repo>
cd smart-mlms
npm install
```

### 2. Start Infrastructure

```bash
docker-compose up -d
```

Services:
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`
- MinIO: `localhost:9000` (Console: `localhost:9001`)

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env với credentials phù hợp
```

### 4. Run Development

```bash
# Terminal 1 - Backend API
cd apps/api
npm install
npm run dev

# Terminal 2 - Frontend
cd apps/web
npm install
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

## 📁 Cấu trúc Project

```
smart-mlms/
├── apps/
│   ├── web/                # Next.js Frontend
│   │   └── src/
│   │       ├── app/        # Pages (App Router)
│   │       └── lib/        # Utilities, API, Store
│   │
│   ├── api/                # NestJS Backend
│   │   └── src/
│   │       ├── modules/    # Feature modules
│   │       └── schemas/    # Mongoose schemas
│   │
│   └── ai-engine/          # FastAPI AI (Phase 3)
│
├── docker-compose.yml      # MongoDB, Redis, MinIO
└── turbo.json             # Monorepo config
```

## 🔌 API Modules

| Module | Mô tả |
|--------|-------|
| **Auth** | JWT authentication, login/register |
| **Users** | CRUD users, RBAC, trust score |
| **Units** | Tổ chức đơn vị quân sự (hierarchy) |
| **Courses** | Khóa học, chapters, lessons, progress |
| **Exams** | Ngân hàng câu hỏi, bài thi, violations |
| **Audit** | Ghi log mọi thao tác |

## 👥 Roles

| Role | Quyền |
|------|-------|
| **ADMIN** | Full access |
| **TEACHER** | Manage courses, exams, view reports |
| **STUDENT** | Learn, take exams |

## 🛡️ Trust Score

Điểm tín nhiệm học viên (0-100):
- ✅ Hoàn thành bài học: +2
- ✅ Đậu bài thi: +5
- ❌ Tab switch: -2
- ❌ Face not detected: -3
- ❌ Phone detected: -5
- ❌ Multiple faces: -10

## 🔜 Roadmap

- [x] Phase 1: Foundation (Auth, RBAC, DB, UI)
- [ ] Phase 2: LMS Core (Full CRUD, Progress tracking)
- [ ] Phase 3: AI Proctoring (Face detection, violations)
- [ ] Phase 4: Reports & Polish

## 📄 License

Proprietary - Military Use Only
