# A+ Learning Management System (LMS)

A comprehensive Learning Management System built with **Next.js 15**, **React 19**, and **TypeScript**, designed for A+ Computer Training and modern educational institutions.

![A+ LMS Logo](https://raw.githubusercontent.com/psalmseins01/AplusLMS/main/public/placeholder-logo.svg)

## 🚀 Features

### Core Functionality
- **Role-based Access Control**: Admin, Educator, and Learner roles
- **Course Management**: Create, edit, and manage courses with rich content
- **Progress Tracking**: Monitor learning progress and achievements
- **Certificate System**: Generate and download course completion certificates
- **Responsive Design**: Mobile-friendly interface with modern UI
- **Interactive Dashboard**: Personalized learning experience

### User Roles
- **Learners**: Enroll in courses, track progress, earn certificates
- **Educators**: Create/manage courses, track student progress, analyze performance
- **Admins**: Full system access, user management, and platform configuration

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.2.4, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Package Manager**: pnpm

## ⚠️ Current Limitations (Demo Version)

This is a **frontend-only demo** with the following limitations:

1. **Authentication**: Mock authentication using localStorage (NOT production-ready)
2. **Data Storage**: All data stored in browser localStorage (will be lost on clear)
3. **Backend**: No server-side API (frontend-only)
4. **Security**: No real security measures implemented

## 🚨 Production Deployment Requirements

**DO NOT deploy this current version to production** without implementing:

### Critical Security & Backend Requirements
1. **Real Authentication System**
   - JWT-based authentication
   - Password hashing (bcrypt)
   - Session management
   - Role-based middleware

2. **Database Integration**
   - PostgreSQL/MySQL for user data
   - MongoDB for course content
   - Redis for caching/sessions

3. **Backend API**
   - RESTful API or GraphQL
   - Input validation & sanitization
   - Rate limiting
   - CORS configuration

4. **File Storage**
   - AWS S3/Cloudinary for media
   - PDF generation for certificates
   - Video streaming for course content

## 🏗️ Development Setup

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
=======
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **State Management**: React Context API
- **Forms**: React Hook Form with Zod validation
- **Charts & Visualization**: Recharts
- **Package Manager**: pnpm

## 📋 Project Status

This project is currently a **frontend-only demonstration** with the following limitations:

1. **Authentication**: Mock authentication using localStorage (NOT production-ready)
2. **Data Storage**: All data stored in browser localStorage (will be lost on clear)
3. **Backend**: No server-side API implementation yet

## 🚨 Production Roadmap

Before deploying to production, the following must be implemented:

### Phase 1: Core Backend Implementation
- Real authentication system with JWT
- Database integration (PostgreSQL/MySQL)
- API endpoints for all frontend features
- Security measures (CSRF protection, rate limiting)

### Phase 2: Advanced Features
- Real-time notifications
- Advanced analytics
- Content management system
- Payment integration

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm package manager
>>>>>>> 696350ded4ec292fc0f4eae9facd7a0953776df4

### Installation

```bash
# Clone the repository
<<<<<<< HEAD
git clone <repository-url>
=======
git clone https://github.com/username/AplusLMS.git

# Navigate to the project directory
>>>>>>> 696350ded4ec292fc0f4eae9facd7a0953776df4
cd AplusLMS

# Install dependencies
pnpm install

<<<<<<< HEAD
# Start development server
pnpm dev
```

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
pnpm build:prod   # Full production build with checks
```

### Demo Accounts

```
Admin: admin@aplus.com / password
Educator: educator@aplus.com / password  
Learner: learner@aplus.com / password
```

## 📁 Project Structure

```
AplusLMS/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── courses/           # Course management
│   ├── dashboard/         # User dashboard
│   └── educator/          # Educator tools
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── public/                # Static assets
└── styles/                # Global styles
```

## 🚀 Deployment Options

### Option 1: Static Export (Current)
```bash
pnpm build
# Upload .next/out/* to static hosting
```

### Option 2: Vercel (Recommended for demo)
```bash
npx vercel
```

### Option 3: Docker (Production-ready setup needed)
```bash
# Requires backend implementation first
docker build -t aplus-lms .
docker run -p 3000:3000 aplus-lms
```

## 🔮 Production Roadmap

### Phase 1: Backend Implementation
- [ ] User authentication & authorization
- [ ] Database schema design
- [ ] REST API endpoints
- [ ] File upload system

### Phase 2: Enhanced Features  
- [ ] Video streaming
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Mobile app (React Native)

### Phase 3: Enterprise Features
- [ ] Multi-tenant architecture
- [ ] Advanced reporting
- [ ] Integration APIs
- [ ] White-label solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is proprietary to A+ Computer Training.

## 📞 Support

For support and questions, contact the A+ Computer Training development team.

---

**⚠️ Important**: This is a demo/prototype. Implement proper backend, authentication, and security measures before any production deployment.
=======
# Create .env file from example
cp .env.example .env

# Start the development server
pnpm dev
```

## 🧪 Testing

```bash
# Run linting
pnpm lint

# Type checking
pnpm type-check

# Build for production
pnpm build:prod
```

## 🐳 Docker Deployment

The project includes Docker configuration for containerized deployment:

```bash
# Build and start containers
docker-compose up -d
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
>>>>>>> 696350ded4ec292fc0f4eae9facd7a0953776df4
