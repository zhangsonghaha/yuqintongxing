# Technology Stack & Build System

## Frontend Stack

**Framework & Language**
- Native WeChat Mini Program (no transpilation)
- JavaScript (ES6+)
- Vant Weapp v1.10.4+ (60+ UI components, 60KB)

**State Management**
- getApp() global variables
- wx.setStorageSync() / wx.getStorageSync() for persistence
- No external state library (keep it simple)

**Networking**
- wx.request() for HTTP calls
- Custom wrapper in utils/request.js
- JWT token in Authorization header
- Automatic 401 handling (redirect to login)

**Development Tools**
- WeChat Developer Tools (official IDE)
- Git for version control
- No build step required (native mini-program)

## Backend Stack

**Framework & Runtime**
- Spring Boot 2.5.15
- Java 8+
- Maven 3.6+ (build tool)

**Core Dependencies**
- Spring Security 5.7.14 (authentication/authorization)
- JWT (io.jsonwebtoken:jjwt 0.9.1)
- MyBatis + PageHelper (ORM & pagination)
- Druid 1.2.27 (connection pooling)
- Swagger 3.0.0 (API documentation)

**Database**
- MySQL 8.0+
- Druid connection pool
- MyBatis for data access

**Additional Services**
- Quartz (scheduled tasks)
- Redis (optional caching)
- RuoYi code generator (rapid CRUD generation)

## Build & Development Commands

### Frontend (WeChat Mini Program)
```bash
# No build step - development is direct in WeChat Developer Tools
# Open project in WeChat Developer Tools
# Real-time preview as you edit
# No npm/yarn required
```

### Backend (Spring Boot)

**Development**
```bash
cd RuoYi-Vue/ruoyi-admin
mvn spring-boot:run
# Starts on http://localhost:8080
# Default credentials: admin / admin123
```

**Build**
```bash
cd RuoYi-Vue
mvn clean package
# Creates JAR in ruoyi-admin/target/
```

**Database Setup**
```bash
# Import SQL schema
mysql -u root -p < sql/ry_20240101.sql
```

**Configuration**
- Edit: `ruoyi-admin/src/main/resources/application.yml`
- Set database URL, username, password
- Configure Redis if needed
- Adjust JWT secret key

## Project Structure

```
workspace/
├── couple-fitness-weapp/          # Frontend mini-program
│   ├── components/                # UI components
│   │   ├── vant/                 # Vant Weapp library
│   │   └── custom/               # Custom components
│   ├── pages/                    # Page implementations
│   ├── utils/                    # Helper functions
│   ├── assets/                   # Images, fonts
│   ├── app.js                    # App entry point
│   ├── app.json                  # App config
│   └── project.config.json       # WeChat config
│
└── RuoYi-Vue/                     # Backend Spring Boot
    ├── ruoyi-admin/              # Admin module (main entry)
    ├── ruoyi-framework/          # Core framework
    ├── ruoyi-system/             # System management
    ├── ruoyi-common/             # Utilities
    ├── ruoyi-quartz/             # Scheduled tasks
    ├── ruoyi-generator/          # Code generation
    └── pom.xml                   # Maven config
```

## Key Configuration Files

**Frontend**
- `couple-fitness-weapp/project.config.json` - WeChat app ID, build settings
- `couple-fitness-weapp/app.json` - Pages, tabbar, permissions
- `couple-fitness-weapp/utils/constants.js` - API endpoints, constants

**Backend**
- `RuoYi-Vue/ruoyi-admin/src/main/resources/application.yml` - Database, server config
- `RuoYi-Vue/ruoyi-admin/src/main/resources/application-druid.yml` - Connection pool
- `RuoYi-Vue/pom.xml` - Maven dependencies

## Development Workflow

1. **Frontend**: Edit in WeChat Developer Tools → Real-time preview
2. **Backend**: Edit in IDE → Run `mvn spring-boot:run` → Test with Postman/Swagger
3. **Integration**: Frontend calls backend APIs via wx.request()
4. **Testing**: Use WeChat simulator + real device testing

## Performance Targets

- Frontend: First screen load < 2 seconds
- Backend: API response < 500ms
- Database: Query response < 100ms
- Mini-program package size: < 2MB

## Deployment

**Frontend**: Upload to WeChat Mini Program platform
**Backend**: Deploy JAR to server (Docker recommended)
**Database**: MySQL instance (cloud or on-premise)
