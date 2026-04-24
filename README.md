# 🌐 Volunteer Management & Outreach Platform
 
A comprehensive full-stack web application designed to streamline volunteer coordination, manage events efficiently, and enhance organizational outreach activities.
 
---
 
## 🚀 Features
 
### 🔐 Authentication System
- **User Registration & Login** with secure JWT authentication
- **Forgot Password** functionality with email reset tokens
- **Role-based Access Control** (Admin / Organizer / Volunteer)
- **Session Management** with automatic token refresh
 
### 📅 Event Management
- **Browse Events** with advanced filtering and search
- **Event Creation** for organizers and admins
- **Event Details** with comprehensive information
- **Event Status Management** (Upcoming/Ongoing/Completed)
 
### 📝 Volunteer Participation
- **Event Enrollment** with role selection
- **Participation Tracking** and history
- **Cancel Participation** with automated notifications
- **Role Assignment** within events
 
### 📊 Dashboard & Analytics
- **Personal Dashboard** for volunteers
- **Admin Dashboard** with comprehensive management
- **Real-time Statistics** and activity tracking
- **Event Analytics** and participation metrics
 
### 🧑‍💼 Role-based System
- **Admin Panel** - User management, system settings
- **Organizer Tools** - Event creation, participant management
- **Volunteer Interface** - Event browsing, enrollment, profile
 
### 🔔 Notifications
- **Email Notifications** for important updates
- **In-app Notifications** with real-time updates
- **Task Assignment** notifications for volunteers
- **System Alerts** for administrators
 
---
 
## 🛠️ Tech Stack
 
### Frontend
```typescript
// Core Technologies
- React 18.2.0 (Vite 5.0+)
- TypeScript 5.0+
- Tailwind CSS 3.4+
 
// Development Tools
- React Router v6 (Client-side routing)
- Axios (HTTP client)
- React Hooks (State management)
- Context API (Global state)
Backend
java
// Microservices Architecture
- Spring Boot 3.x (Main services)
- Spring Security (Authentication)
- API Gateway (Request routing)
- Eureka Server (Service discovery)
 
// Additional Services
- Notification Service
- User Service
- Event Service
Database & Infrastructure
sql
-- Data Layer
- PostgreSQL (Primary database)
- Redis (Caching & sessions)
 
-- DevOps
- Docker (Containerization)
- Maven (Build management)
📂 Project Structure
vms-frontend/
├── 📁 public/
│   ├── favicon.ico
│   └── index.html
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 components/
│   │   │   ├── 📄 AuthGuard.tsx          # Route protection
│   │   │   ├── 📄 Layout.tsx             # Main layout component
│   │   │   ├── 📄 LoadingSpinner.tsx     # Loading states
│   │   │   └── 📄 ToastProvider.tsx     # Notification system
│   │   ├── 📁 routes/
│   │   │   ├── 📄 admin.tsx            # Admin dashboard
│   │   │   ├── 📄 events.tsx            # Event management
│   │   │   ├── 📄 home.tsx              # User dashboard
│   │   │   ├── 📄 login.tsx             # Authentication
│   │   │   ├── 📄 register.tsx          # User registration
│   │   │   ├── 📄 forgot-password.tsx    # Password reset
│   │   │   └── 📄 reset-password.tsx     # Password recovery
│   │   ├── 📁 services/
│   │   │   ├── 📄 api.ts                # API configuration
│   │   │   ├── 📄 events.ts             # Event services
│   │   │   ├── 📄 auth.ts               # Authentication services
│   │   │   └── 📄 productivity.ts       # Task management
│   │   ├── 📄 app.css                  # Global styles
│   │   ├── 📄 root.tsx                # App root
│   │   └── 📄 routes.ts               # Route configuration
│   ├── 📁 assets/                     # Static assets
│   └── 📄 main.tsx                   # Application entry
├── 📄 package.json                    # Dependencies & scripts
├── 📄 tsconfig.json                  # TypeScript configuration
├── 📄 tailwind.config.js              # Tailwind configuration
├── 📄 vite.config.ts                  # Vite build configuration
└── 📄 README.md                      # Project documentation
Backend Structure
vms-api/
├── 📁 user-service/
│   ├── 📁 src/main/java/com/volunteer/userservice/
│   │   ├── 📄 UserController.java       # User endpoints
│   │   ├── 📄 UserService.java         # User business logic
│   │   └── 📄 UserAccount.java         # User entity
├── 📁 event-service/
│   ├── 📁 src/main/java/com/volunteer/eventservice/
│   │   ├── 📄 EventController.java      # Event endpoints
│   │   ├── 📄 EventService.java        # Event business logic
│   │   └── 📄 Event.java              # Event entity
├── 📁 notification-service/
│   ├── 📁 src/main/java/com/volunteer/notificationservice/
│   │   ├── 📄 NotificationController.java # Notification endpoints
│   │   └── 📄 NotificationService.java   # Notification logic
├── 📁 api-gateway/                   # Request routing
├── 📁 eureka-server/                 # Service discovery
└── 📁 API-DOCUMENTATION.md           # API documentation
🚀 Quick Start
Prerequisites
bash
# Node.js 18+ and npm
# Java 17+ and Maven
# PostgreSQL 14+
# Git
Installation
bash
# Clone the repository
git clone <repository-url>
cd vms-frontend
 
# Install frontend dependencies
npm install
 
# Start development server
npm run dev
Environment Setup
env
# API Configuration
VITE_API_URL=http://localhost:8080/api
VITE_API_TIMEOUT=10000
 
# Authentication
VITE_JWT_SECRET=your-jwt-secret
VITE_TOKEN_REFRESH_INTERVAL=300000
📱 Screenshots
🏠 User Dashboard
DashboardMain dashboard showing upcoming events, statistics, and quick actions

📅 Event Management
EventsEvent browsing with filtering, search, and enrollment options

🔐 Authentication
LoginModern login interface with forgot password functionality

👥 Admin Panel
AdminComprehensive admin dashboard with user and event management

🔧 Configuration
Development
bash
# Development server
npm run dev          # Start Vite dev server (port 5173)
 
# Type checking
npm run type-check    # TypeScript validation
 
# Linting
npm run lint         # ESLint code quality check
Production
bash
# Build for production
npm run build        # Optimized production build
 
# Preview production build
npm run preview      # Preview built application
 
# Build analysis
npm run analyze      # Bundle size analysis

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

📞 Contact
Developer: Balaji
Email: [bbala1401_bcs27@mepcoeng.ac.in]
