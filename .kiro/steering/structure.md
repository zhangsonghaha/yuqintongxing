# Project Structure & Organization

## Repository Layout

This is a **multi-project workspace** containing both frontend and backend:

```
workspace/
├── couple-fitness-weapp/          # WeChat Mini Program (Frontend)
├── RuoYi-Vue/                     # Spring Boot Backend
├── _bmad-output/                  # Documentation artifacts
└── .kiro/                         # Kiro configuration
```

## Frontend: couple-fitness-weapp/

**Purpose**: WeChat mini-program for couple fitness tracking

### Directory Structure

```
couple-fitness-weapp/
├── components/
│   ├── vant/                      # Vant Weapp UI library (60+ components)
│   │   ├── button/
│   │   ├── card/
│   │   ├── cell/
│   │   ├── tabbar/
│   │   ├── calendar/
│   │   ├── dialog/
│   │   ├── toast/
│   │   ├── field/
│   │   └── ... (other Vant components)
│   └── custom/                    # Custom components
│       ├── check-in-card/         # Check-in display card
│       ├── partner-status/        # Partner status indicator
│       ├── achievement-card/      # Achievement display
│       └── quick-reply/           # Quick message replies
│
├── pages/                         # Page implementations
│   ├── index/                     # Home page (main check-in)
│   │   ├── index.js              # Logic
│   │   ├── index.wxml            # Template
│   │   ├── index.wxss            # Styles
│   │   └── index.json            # Config
│   ├── calendar/                  # Shared calendar view
│   ├── pet/                       # Virtual pet (V1.0)
│   ├── profile/                   # User profile & settings
│   ├── chat/                      # Messaging
│   └── login/                     # Authentication
│
├── utils/                         # Utility functions
│   ├── api.js                     # API endpoint definitions
│   ├── request.js                 # HTTP request wrapper
│   ├── storage.js                 # Local storage helpers
│   ├── date.js                    # Date formatting utilities
│   ├── validate.js                # Input validation
│   └── constants.js               # App constants & config
│
├── styles/                        # Global styles
├── assets/                        # Static resources
│   ├── fonts/
│   ├── images/
│   │   ├── backgrounds/
│   │   ├── icons/
│   │   └── illustrations/
│
├── app.js                         # App entry point
├── app.json                       # App configuration (pages, tabbar, permissions)
├── app.wxss                       # Global styles
├── project.config.json            # WeChat Developer Tools config
├── sitemap.json                   # Mini-program sitemap
└── README.md                      # Project documentation
```

### Key Files

| File | Purpose |
|------|---------|
| `app.js` | Global app instance, lifecycle hooks |
| `app.json` | Pages list, tabbar config, permissions |
| `utils/api.js` | All backend API calls organized by feature |
| `utils/request.js` | HTTP wrapper with token handling |
| `utils/storage.js` | Local storage abstraction |
| `project.config.json` | WeChat app ID, build settings |

### Naming Conventions

- **Files**: lowercase with hyphens (e.g., `check-in-card`)
- **Variables**: camelCase (e.g., `checkInList`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Event handlers**: `on` + PascalCase (e.g., `onCheckIn`)
- **Components**: PascalCase (e.g., `CheckInCard`)

## Backend: RuoYi-Vue/

**Purpose**: Spring Boot REST API backend with admin management system

### Module Structure

```
RuoYi-Vue/
├── ruoyi-admin/                   # Main application module
│   ├── src/main/java/com/ruoyi/
│   │   ├── controller/            # REST endpoints
│   │   │   ├── CheckInController.java
│   │   │   ├── ChatController.java
│   │   │   ├── AchievementController.java
│   │   │   └── UserController.java
│   │   ├── service/               # Business logic
│   │   ├── mapper/                # Data access (MyBatis)
│   │   └── entity/                # Domain models
│   ├── src/main/resources/
│   │   ├── application.yml        # Main config
│   │   ├── application-druid.yml  # Database pool config
│   │   ├── logback.xml            # Logging config
│   │   └── i18n/                  # Internationalization
│   └── pom.xml                    # Module dependencies
│
├── ruoyi-framework/               # Core framework
│   ├── config/                    # Spring configurations
│   ├── interceptor/               # Request interceptors
│   ├── security/                  # JWT & Spring Security
│   └── exception/                 # Exception handlers
│
├── ruoyi-system/                  # System management module
│   ├── system/user/               # User management
│   ├── system/role/               # Role management
│   ├── system/menu/               # Menu management
│   └── system/permission/         # Permission control
│
├── ruoyi-common/                  # Shared utilities
│   ├── utils/                     # Helper functions
│   ├── constant/                  # Constants
│   └── exception/                 # Exception definitions
│
├── ruoyi-quartz/                  # Scheduled tasks
├── ruoyi-generator/               # Code generation tool
├── pom.xml                        # Root POM (dependency management)
└── README.md                      # Project documentation
```

### Core Modules Explained

| Module | Purpose | Key Classes |
|--------|---------|-------------|
| `ruoyi-admin` | Main REST API | Controllers, Services, Mappers |
| `ruoyi-framework` | Infrastructure | Security, Interceptors, Config |
| `ruoyi-system` | User/Role/Menu | Built-in admin features |
| `ruoyi-common` | Shared code | Utils, Constants, Exceptions |
| `ruoyi-quartz` | Scheduled jobs | Task scheduling |
| `ruoyi-generator` | Code gen | Rapid CRUD generation |

### Database Schema

**Core Tables**
- `sys_user` - User accounts
- `check_in_record` - Fitness check-in logs
- `chat_message` - Messages between partners
- `achievement` - Unlocked achievements
- `sys_role`, `sys_menu`, `sys_permission` - RuoYi admin tables

### Naming Conventions

- **Packages**: lowercase (e.g., `com.ruoyi.checkin`)
- **Classes**: PascalCase (e.g., `CheckInController`)
- **Methods**: camelCase (e.g., `addCheckIn()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `CHECK_IN_SUCCESS`)
- **Database tables**: lowercase_snake_case (e.g., `check_in_record`)
- **Database columns**: lowercase_snake_case (e.g., `check_in_date`)

## API Architecture

### Request/Response Pattern

**Request**
```javascript
POST /api/checkin/add
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "checkInDate": "2026-03-10",
  "duration": 30,
  "type": "fitness"
}
```

**Success Response**
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1,
    "checkInDate": "2026-03-10",
    "duration": 30,
    "createTime": "2026-03-10 10:30:00"
  }
}
```

**Error Response**
```json
{
  "code": 500,
  "msg": "操作失败",
  "data": null
}
```

## Development Workflow

### Adding a New Feature

**Backend**
1. Create entity class in `ruoyi-admin/src/main/java/com/ruoyi/entity/`
2. Create mapper interface in `mapper/`
3. Create service class in `service/`
4. Create controller in `controller/`
5. Add permission in admin system

**Frontend**
1. Create API functions in `utils/api.js`
2. Create page or component in `pages/` or `components/custom/`
3. Use Vant components from `components/vant/`
4. Call API via `utils/request.js`

### Code Generation (Backend)

Use RuoYi's built-in code generator:
1. Login to admin panel (http://localhost:8080)
2. Go to System Tools → Code Generation
3. Select database table
4. Configure options
5. Download generated code (Entity, Mapper, Service, Controller, XML)

## File Organization Principles

- **Separation of concerns**: Logic, UI, styles in separate files
- **Reusability**: Common code in utils/, shared components
- **Scalability**: Organized by feature/module, not by type
- **Clarity**: Clear naming, logical grouping
- **Consistency**: Follow naming conventions across projects

## Important Paths

| Path | Purpose |
|------|---------|
| `couple-fitness-weapp/utils/api.js` | All API calls |
| `couple-fitness-weapp/utils/request.js` | HTTP wrapper |
| `RuoYi-Vue/ruoyi-admin/src/main/resources/application.yml` | Backend config |
| `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/controller/` | REST endpoints |
| `.kiro/specs/` | Feature specifications |
