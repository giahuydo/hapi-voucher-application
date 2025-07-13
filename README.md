# Hapi Voucher Application

A Node.js application built with Hapi.js for voucher management system with email notifications and background job processing.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Development Guide](#-development-guide)
- [Deployment](#-deployment)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production
npm run build
npm start

# Testing
npm test
```

## 🏗️ Architecture Overview

### Tech Stack
- **Framework**: Hapi.js (v21.4.0)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Queue System**: Bull (Redis-based)
- **Scheduler**: Agenda (MongoDB-based)
- **Email**: Nodemailer
- **Validation**: Joi

### Architecture Pattern
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Layer     │    │  Service Layer  │    │  Data Layer     │
│   (Hapi.js)     │───▶│  (Business      │───▶│  (MongoDB)      │
│                 │    │   Logic)        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Background     │    │  Queue System   │    │  Scheduled      │
│  Jobs (Bull)    │    │  (Redis)        │    │  Jobs (Agenda)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
hapi-voucher-application/
├── src/
│   ├── api/
│   │   └── voucher/
│   │       ├── controller.ts      # API controllers
│   │       ├── routes.ts          # Route definitions
│   │       └── validator.ts       # Request validation
│   ├── models/
│   │   ├── event.model.ts         # Event schema
│   │   └── voucher.model.ts       # Voucher schema
│   ├── services/
│   │   └── voucher.service.ts     # Business logic
│   └── jobs/
│       ├── queues/
│       │   └── email.queue.ts     # Email queue setup
│       ├── services/
│       │   └── email.service.ts   # Email service
│       └── worker/
│           └── email.worker.ts    # Email worker
├── agenda/
│   ├── agenda.instance.ts         # Agenda configuration
│   └── jobs/
│       └── unlockVoucherLocks.job.ts  # Scheduled jobs
├── tests/
│   ├── setup.ts                   # Test environment setup
│   ├── unit/
│   │   └── services/
│   │       └── voucher.service.test.ts
│   └── integration/
│       └── api/
│           └── voucher.test.ts
├── server.ts                      # Application entry point
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 📊 API Documentation

### POST /events/{eventId}/request-voucher

Request a voucher for an event.

**Endpoint:** `POST /events/{eventId}/request-voucher`

**Parameters:**
- `eventId` (string, required): MongoDB ObjectId of the event

**Request Body:**
```json
{
  "userId": "user123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "✅ Voucher issued successfully.",
  "data": {
    "code": "VC-ABC12345"
  }
}
```

**Error Responses:**

**Event Not Found/Exhausted (456):**
```json
{
  "success": false,
  "message": "🎟️ Voucher has been exhausted.",
  "code": 456
}
```

**Validation Error (400):**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid request payload input"
}
```

**Internal Server Error (500):**
```json
{
  "success": false,
  "message": "Internal server error.",
  "code": 500
}
```

## 🧪 Testing

### Test Setup

```bash
# Install test dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Structure

```
tests/
├── setup.ts                    # Global test setup
├── unit/                       # Unit tests
│   └── services/
│       └── voucher.service.test.ts
└── integration/                # Integration tests
    └── api/
        └── voucher.test.ts
```

### Test Types

#### Unit Tests
- Test individual functions in isolation
- Mock external dependencies (database, queue, email)
- Fast execution
- Example: `tests/unit/services/voucher.service.test.ts`

#### Integration Tests
- Test API endpoints with real database
- Use MongoDB Memory Server
- Test complete workflows
- Example: `tests/integration/api/voucher.test.ts`

### Test Configuration

#### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000
};
```

#### Test Setup (`tests/setup.ts`)
```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to test database
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Cleanup
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
```

### Running Tests

```bash
# Run specific test file
npm test -- voucher.service.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should issue voucher"

# Run tests with verbose output
npm test -- --verbose
```

### Coverage Reports

After running `npm run test:coverage`, check:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - Coverage data for CI

### 🔧 Architecture Issues

#### 1. Inconsistent File Structure
```
❌ Current:
- models/ (root)
- services/ (root) 
- src/api/ (src/)

✅ Recommended:
- src/models/
- src/services/
- src/api/
```

#### 2. Missing Configuration Management
```typescript
// ❌ Scattered environment variables
// ✅ Should have central config:
import config from './config';
```

#### 3. No Database Connection Setup
```typescript
// ❌ Missing connection pooling, error handling
// ✅ Should have:
mongoose.connect(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### 🐛 Code Quality Issues

#### 1. Missing Input Validation
```typescript
// ❌ No ObjectId validation
export const requestVoucherValidator = {
  params: Joi.object({
    eventId: Joi.string().required()  // Should validate ObjectId
  })
};

// ✅ Should be:
eventId: Joi.string().hex().length(24).required()
```

#### 2. Incomplete Event Model
```typescript
// ❌ Missing important fields:
// - status (active/inactive)
// - startDate, endDate
// - description
// - editingBy, editLockAt (referenced in agenda job)
```

#### 3. Email System Issues
```typescript
// ❌ Hard-coded HTML templates
// ❌ No email queue error handling
// ❌ No retry mechanism
```

### 📧 Email System Issues

#### 1. No Email Templates
```typescript
// ❌ Hard-coded HTML
html: `
  <h3>Congratulations!</h3>
  <p>You have received a voucher code:</p>
  <h2>${code}</h2>
  <p>Use it before it expires.</p>
`

// ✅ Should use template system:
const template = await loadEmailTemplate('voucher-issued', { code });
```

#### 2. No Queue Error Handling
```typescript
// ❌ No retry mechanism
catch (err) {
  console.error(`❌ Failed to send email to ${to}:`, err);
  throw err; 
}

// ✅ Should have:
// - Retry configuration
// - Dead letter queue
// - Error monitoring
```

### 🔄 Queue System Issues

#### 1. No Queue Configuration
```typescript
// ❌ Missing configuration
const emailQueue = new Bull('emailQueue', {
  redis: { host: '127.0.0.1', port: 6379 }
});

// ✅ Should have:
const emailQueue = new Bull('emailQueue', {
  redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50
  }
});
```

## 🔧 Development Guide

### Environment Setup

Create `.env` file:
```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/voucher_app
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npx tsc --noEmit
```

### Database Models

#### Event Model (`src/models/event.model.ts`)
```typescript
export interface EventDocument extends Document {
  name: string;
  maxQuantity: number;
  issuedCount: number;
  createdAt: Date;
  // Missing fields:
  // status: 'active' | 'inactive';
  // startDate: Date;
  // endDate: Date;
  // description: string;
  // editingBy: string | null;
  // editLockAt: Date | null;
}
```

#### Voucher Model (`src/models/voucher.model.ts`)
```typescript
export interface VoucherDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  code: string;
  issuedTo: string;
  isUsed: boolean;
  createdAt: Date;
  // Missing fields:
  // expiresAt: Date;
  // usedAt: Date | null;
}
```

### Business Logic

#### Voucher Service (`src/services/voucher.service.ts`)
```typescript
export const issueVoucher = async ({
  eventId,
  userId
}: IssueVoucherInput): Promise<VoucherResponse> => {
  // ✅ Good: Transaction handling
  // ✅ Good: Retry logic
  // ❌ Issue: Voucher code generation not unique
  // ❌ Issue: Generic error handling
};
```

### Background Jobs

#### Email Queue (`src/jobs/queues/email.queue.ts`)
```typescript
const emailQueue = new Bull('emailQueue', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379
  }
  // ❌ Missing: Retry config, job options
});
```

#### Email Worker (`src/jobs/worker/email.worker.ts`)
```typescript
emailQueue.process(async (job) => {
  const { to, code } = job.data as EmailJobData;
  
  try {
    await sendEmail({ to, code });
  } catch (err) {
    // ❌ No retry mechanism
    throw err; 
  }
});
```

## 🚀 Deployment

### Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb://production-db:27017/voucher_app
EMAIL_USER=production@example.com
EMAIL_PASS=app-password
REDIS_HOST=redis-server
REDIS_PORT=6379
```

### Monitoring & Logging

#### Recommended Tools:
- **Logging**: Winston or Pino
- **Monitoring**: Prometheus + Grafana
- **Error Tracking**: Sentry
- **Health Checks**: `/health` endpoint

#### Health Check Endpoint:
```typescript
server.route({
  method: 'GET',
  path: '/health',
  handler: async (request, h) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: await checkRedisConnection()
    };
    
    return h.response(health).code(200);
  }
});
```

## 📈 Performance Optimization

### Database Optimization
```typescript
// Add indexes
eventSchema.index({ name: 1 });
voucherSchema.index({ eventId: 1, issuedTo: 1 });
voucherSchema.index({ code: 1 }, { unique: true });
```

### Caching Strategy
```typescript
// Redis caching for frequently accessed data
const cacheEvent = async (eventId: string, event: any) => {
  await redis.setex(`event:${eventId}`, 3600, JSON.stringify(event));
};
```

### Rate Limiting
```typescript
// Add rate limiting to prevent abuse
import rateLimit from 'hapi-rate-limit';

await server.register(rateLimit);
```

## 🔒 Security Considerations

### Input Validation
```typescript
// Validate ObjectId format
eventId: Joi.string().hex().length(24).required()

// Sanitize inputs
const sanitizedUserId = validator.escape(userId);
```

### Authentication & Authorization
```typescript
// Add JWT authentication
import jwt from 'jsonwebtoken';

const validateToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};
```

### Email Security
```typescript
// Use app passwords for Gmail
// Enable 2FA on email account
// Use environment variables for sensitive data
```

## 🧪 Testing Best Practices

### Test Organization
```typescript
describe('VoucherService', () => {
  describe('issueVoucher', () => {
    it('should issue voucher successfully when event has available vouchers', async () => {
      // Arrange - Setup test data
      // Act - Execute function
      // Assert - Verify results
    });
  });
});
```

### Mocking Strategy
```typescript
// Mock external dependencies
jest.mock('../../../src/models/event.model');
jest.mock('../../../src/jobs/queues/email.queue');

// Use dependency injection for better testability
export class VoucherService {
  constructor(
    private eventModel: typeof Event,
    private voucherModel: typeof Voucher,
    private emailQueue: typeof emailQueue
  ) {}
}
```

### Test Data Management
```typescript
// Use factories for test data
const createTestEvent = (overrides = {}) => ({
  name: 'Test Event',
  maxQuantity: 100,
  issuedCount: 0,
  ...overrides
});
```

## 📊 Metrics & Monitoring

### Key Metrics to Track
- Voucher issuance rate
- Email delivery success rate
- API response times
- Database connection health
- Queue processing times

### Logging Strategy
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run build
```

## 📚 Additional Resources

- [Hapi.js Documentation](https://hapi.dev/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [Agenda Documentation](https://github.com/agenda/agenda)
- [Jest Documentation](https://jestjs.io/)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

ISC License 

## 🔍 **PHÂN TÍCH CODE HIỆN TẠI - NHỮNG PHẦN THIẾU**

Dựa trên yêu cầu RESTful APIs, code hiện tại thiếu những phần sau:

---

## ❌ **1. RESTful API Naming Best Practices**

### **Hiện tại:**
```typescript
// ❌ Không theo RESTful conventions
POST /events/{eventId}/request-voucher
```

### **Cần thay đổi thành:**
```typescript
<code_block_to_apply_changes_from>
```

---

## ❌ **2. CRUD APIs Thiếu**

### **Hiện tại chỉ có:**
- `POST /events/{eventId}/request-voucher` (Create voucher)

### **Thiếu các CRUD operations:**
- **Events CRUD:**
  - `GET /events` (List events)
  - `POST /events` (Create event)
  - `GET /events/{id}` (Get event)
  - `PUT /events/{id}` (Update event)
  - `DELETE /events/{id}` (Delete event)

- **Vouchers CRUD:**
  - `GET /vouchers` (List vouchers)
  - `GET /vouchers/{id}` (Get voucher)
  - `PUT /vouchers/{id}` (Update voucher)
  - `DELETE /vouchers/{id}` (Delete voucher)

---

## ❌ **3. CORS Configuration Thiếu**

### **Hiện tại:**
```typescript
// ❌ Không có CORS setup
const server = Hapi.server({
  port: process.env.PORT || 3000,
  host: 'localhost'
});
```

### **Cần thêm:**
```typescript
// ✅ CORS configuration
const server = Hapi.server({
  port: process.env.PORT || 3000,
  host: 'localhost',
  routes: {
    cors: {
      origin: ['http://localhost:3000', 'https://yourdomain.com'],
      credentials: true
    }
  }
});
```

---

## ❌ **4. Authentication Thiếu**

### **Hiện tại:**
```typescript
// ❌ Không có authentication
export const requestVoucher = async (req: Request, h: ResponseToolkit) => {
  const { userId } = req.payload as { userId: string };
  // No JWT validation
};
```

### **Cần thêm:**
```typescript
// ✅ JWT Authentication
import jwt from 'jsonwebtoken';

const validateToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

// Add authentication to routes
{
  method: 'POST',
  path: '/events/{eventId}/vouchers',
  options: {
    auth: 'jwt',
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required()
      }).unknown()
    }
  }
}
```

---

## ❌ **5. Swagger Documentation Thiếu**

### **Hiện tại:**
```typescript
// ❌ Không có API documentation
const voucherRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/events/{eventId}/request-voucher',
    options: {
      tags: ['api'],
      // No Swagger docs
    }
  }
];
```

### **Cần thêm:**
```typescript
// ✅ Swagger documentation
import hapiSwagger from 'hapi-swagger';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';

// Register Swagger plugins
await server.register([
  Inert,
  Vision,
  {
    plugin: hapiSwagger,
    options: {
      info: {
        title: 'Voucher API',
        version: '1.0.0'
      }
    }
  }
]);

// Add Swagger docs to routes
{
  method: 'POST',
  path: '/events/{eventId}/vouchers',
  options: {
    tags: ['api'],
    description: 'Request a voucher for an event',
    notes: 'Creates a new voucher for the specified event',
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Voucher created successfully'
          },
          '400': {
            description: 'Bad request'
          }
        }
      }
    }
  }

```

---

## **Tóm tắt các phần còn thiếu:**

1. **RESTful resource naming**: Đang dùng `/request-voucher`, nên chuyển sang `/vouchers` theo chuẩn REST.
2. **CRUD APIs**: Chỉ có 1 API tạo voucher, thiếu toàn bộ CRUD cho cả Event và Voucher.
3. **CORS**: Chưa cấu hình, cần bật để client truy cập được.
4. **Authentication**: Chưa có xác thực (JWT hoặc session).
5. **Swagger**: Chưa có tài liệu hóa API tự động.

---

## **Đề xuất tiếp theo:**
- Refactor lại route và controller cho đúng RESTful.
- Thêm CRUD cho Event và Voucher.
- Thêm cấu hình CORS trong Hapi server.
- Thêm xác thực JWT (hoặc OAuth2 tuỳ nhu cầu).
- Cài đặt và cấu hình Swagger (hapi-swagger) để tự động sinh tài liệu API.

Nếu bạn muốn, tôi có thể hướng dẫn từng bước hoặc code mẫu cho từng phần trên! 