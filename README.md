# Document Converter

A robust, Express.js backend service that transforms data between multiple formats (JSON, XML, and custom string delimiters). Built with TypeScript, featuring comprehensive testing, OpenAPI documentation, and a clean architectural design using the Strategy Pattern.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
  - [Development Mode](#development-mode)
- [Architecture & Design Decisions](#architecture--design-decisions)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Testing](#testing)
  - [Running Tests](#running-tests)
  - [Test Coverage](#test-coverage)
  - [Manual Testing](#manual-testing)
- [Example Data Formats](#example-data-formats)

## Features

✅ **Multi-Format Support:** Convert between JSON, XML, and custom delimiter-based string formats

✅ **Automatic Format Detection:** Intelligently detects input format (JSON, XML, or string) based on content analysis

✅ **Custom Delimiters:** Support configurable segment and element delimiters for string parsing and formatting

✅ **Type-Safe:** Full TypeScript support with strict mode enabled for compile-time error detection

✅ **Comprehensive Testing:** Unit tests with high coverage using Vitest with isolation and fast executionSample JSON Data:

✅ **Interactive Documentation:** Built-in Swagger UI for API exploration and browser-based testing

✅ **Security:** CORS and Helmet middleware for secure API exposure and protection against common attacks

✅ **Structured Logging:** Pino logger for production-grade observability with request tracing

✅ **Request Validation:** Zod schemas for robust input validation with precise error messages

✅ **Error Handling:** Domain-driven error handling with meaningful, actionable error messages

✅ **Health Checks:** Built-in health check endpoint for monitoring and orchestration compatibility

✅ **Production Ready:** Docker support, environment-based configuration, and graceful shutdown handling

## Getting Started

### Prerequisites

- **Node.js:** Version 18 or higher (verify with `node --version`)
- **Package Manager:** pnpm 10.14.0 or higher (install globally with `npm install -g pnpm`)
- **Git:** For cloning the repository
- **Docker:** (Optional) For containerized deployment

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Spencerhutch/Document-Converter
   cd document-converter
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

   This command:
   - Reads `package.json` and `pnpm-lock.yaml`
   - Installs exact versions specified in lock file
   - Creates `node_modules` directory
   - Sets up TypeScript and development tools

### Environment Setup

Copy the `.env.template` into the `.env` file

```bash
cp .env.template .env
```

## Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
pnpm start:dev
```

This command:

- Watches for file changes in `src/`
- Automatically restarts the server on save
- Preserves TypeScript source maps for debugging
- Logs at `info` level for readability
- Disables minification for readable error messages

**Expected output:**

```
Server (development) running on port http://localhost:8080
```

**What you can now do:**

- Visit `http://localhost:8080/` to access the OpenAPI Swagger API
- Visit `http://localhost:8080/health-check` to verify the server is running
- Visit `http://localhost:8080/api-docs` to access the interactive API documentation
- Make requests to `POST http://localhost:8080/transform`

## Architecture & Design Decisions

### Overview

This project follows a **layered architecture** with clear separation of concerns:

```

┌─────────────────────────────────────────────┐
│  HTTP Layer (Routes, Controllers)           │  Handles protocol concerns
│                                             │
│  Service Layer (Business Logic)             │  Orchestrates transformation
│                                             │
│  Strategy Layer (Format Parsers/Formatters) │  Implements formats
│                                             │
│  Domain Layer (Data Models, Errors)         │  Core entities
└─────────────────────────────────────────────┘

```

This structure ensures:

- **Testability:** Each layer can be tested in isolation
- **Flexibility:** Easy to swap implementations (e.g., different HTTP framework)
- **Maintainability:** Changes to one layer don't cascade to others
- **Scalability:** New features can be added without modifying existing code

### Key Design Patterns

#### 1. **Strategy Pattern** (Parsers & Formatters)

**Why:** The core requirement—transforming between multiple formats—naturally fits the Strategy Pattern. This pattern allows us to:

- Define a family of algorithms (parsing/formatting for each format)
- Make them interchangeable at runtime
- Encapsulate each format's logic independently
- Add new formats without modifying existing code (Open/Closed Principle)

**How it's implemented:**

```typescript
// Interface defines the contract
export interface IParser {
  parse(data: unknown, options?: Record<string, string>): unknown
}

// Each format has its own implementation
export class JsonParser implements IParser {
  /* ... */
}
export class XmlParser implements IParser {
  /* ... */
}
export class StringParser implements IParser {
  /* ... */
}
```

**Real-world benefit:** Want to add YAML support? Just create `YamlParser` implementing `IParser`. No changes needed to the `TransformerService` or `TransformController`.

#### 2. **Factory Pattern** (StrategyFactory)

**Why:** Creating the right parser/formatter based on a string type requires a factory. Benefits:

- Centralizes format-to-implementation mapping
- Easier to maintain supported format list
- Encapsulates instantiation logic
- Provides meaningful error handling for unsupported formats
- Enables runtime format registration without recompilation

**How it's implemented:**

```typescript
export class StrategyFactory implements IStrategyFactory {
  getParser(type: string): IParser {
    switch (type.toLowerCase()) {
      case 'json':
        return new JsonParser()
      case 'xml':
        return new XmlParser()
      case 'string':
        return new StringParser()
      default:
        throw new UnsupportedTypeError(type)
    }
  }
}
```

#### 3. **Dependency Injection (Constructor Injection)**

**Why:** Makes the code testable, flexible, and loosely coupled:

```typescript
// ✅ Good - Injectable dependency
class TransformController {
  constructor(private service: TransformerService) {}
}

// ❌ Bad - Hard-coded dependency
class TransformController {
  private service = new TransformerService(new StrategyFactory())
}
```

**Benefits:**

- **Testability:** Can inject mock services in tests
- **Flexibility:** Can swap implementations at runtime
- **Decoupling:** Classes don't need to know how to create their dependencies
- **Configurability:** Different configurations for dev, test, and production

#### 4. **Separation of HTTP Concerns from Business Logic**

**Why:** The `TransformerService` is completely HTTP-agnostic:

- It can be used in CLI tools, background jobs, or other contexts
- HTTP concerns (status codes, headers) stay in the Controller
- Business logic is independently testable without mocking Express
- Easier to refactor HTTP layer without affecting core logic

**Example:**

```typescript
// Service knows nothing about HTTP
class TransformerService {
  execute(data, inputType, outputType, options) {
    // Pure business logic
    const parser = this.factory.getParser(inputType)
    const formatter = this.factory.getFormatter(outputType)
    return formatter.format(parser.parse(data))
  }
}

// Controller handles HTTP
class TransformController {
  transform = (req: Request, res: Response) => {
    try {
      const result = this.service.execute(
        req.body,
        inputType,
        req.query.outputType
      )
      res.status(200).json(result) // HTTP concern
    } catch (error) {
      res.status(400).json({ error: error.message }) // HTTP concern
    }
  }
}
```

#### 5. **Automatic Format Detection**

**Why:** While format detection heuristics can be fragile, we use them as a convenience feature because:

- Reduces boilerplate for clients
- Preserves backward compatibility
- The API still requires explicit `outputType`, preventing ambiguity
- Gracefully falls back to string if detection fails
- Detection logic is centralized and easily testable

**Detection heuristics (in order):**

1. If `typeof data === 'object'` → JSON
2. If string starts with `{` or `[` → JSON
3. If string starts with `<` → XML
4. Otherwise → String (plaintext/delimited)

#### 6. **Custom Delimiters as Query Parameters**

**Why query parameters instead of request body?**

```bash
# Query parameters (our approach)
POST /transform?segmentDelineator=~&elementDelineator=*
Body: string data

# Alternative (would require JSON body with metadata)
POST /transform
Body: { data: "...", segmentDelineator: "~" }
```

**Reasons for query parameters:**

- Delimiters are transformation **metadata**, not data itself
- Simpler request format for simple data
- Easier to specify in URLs and cURL commands
- RESTful convention for configuration options
- Better separation of concerns

#### 7. **OpenAPI/Swagger Auto-Generation**

**Why auto-generate instead of manually maintaining documentation?**

- **Single Source of Truth:** Zod schemas in code are the authoritative API specification
- **Sync Guarantee:** Documentation always matches actual API behavior
- **Reduces Drift:** No risk of docs being outdated
- **Developer Experience:** Interactive Swagger UI for testing without external tools
- **Maintenance:** Changes to schemas automatically update docs

#### 8. **Domain-Driven Error Handling**

**Why domain-specific error classes?**

```typescript
// ✅ Domain error
export class UnsupportedTypeError extends Error {
  constructor(type: string) {
    super(`Format '${type}' is not supported`)
  }
}

// In controller: catch and map to HTTP status
try {
  result = this.service.execute(...)
} catch (error) {
  if (error instanceof UnsupportedTypeError) {
    return res.status(400).json({ error: error.message })
  }
  next(error) // Delegate to global handler (500)
}
```

**Benefits:**

- Distinguishes between client errors (400) and server errors (500)
- Clients can handle specific error types
- Prevents exposing sensitive server errors
- Makes error handling explicit and testable

---

## Project Structure

```
document-converter/
├── src/
│   ├── api/                          # HTTP Layer - Protocol concerns
│   │   ├── controllers/
│   │   │   ├── TransformController.ts   # HTTP request/response handling
│   │   │   └── __tests__/               # Controller unit tests
│   │   ├── routes/
│   │   │   ├── transform.routes.ts      # Route definitions & orchestration
│   │   │   └── __tests__/               # Route integration tests
│   │   └── healthCheck/
│   │       ├── healthCheck.routes.ts    # Health check endpoint
│   │       └── __tests__/               # Health check tests
│   │
│   ├── core/                         # Core Business Logic - Format-agnostic
│   │   ├── domain/
│   │   │   └── errors.ts                # Domain-specific error classes
│   │   ├── interfaces/
│   │   │   ├── IFormatter.ts            # Output formatter contract
│   │   │   ├── IParser.ts               # Input parser contract
│   │   │   └── IStrategyFactory.ts      # Factory contract
│   │   ├── services/
│   │   │   └── TransformerService.ts    # Core transformation orchestration
│   │   └── strategies/
│   │       ├── StrategyFactory.ts       # Instantiates parsers & formatters
│   │       ├── parsers/
│   │       │   ├── JsonParser.ts        # Parse JSON to intermediate format
│   │       │   ├── XmlParser.ts         # Parse XML to intermediate format
│   │       │   ├── StringParser.ts      # Parse delimited strings
│   │       │   └── __tests__/           # Parser unit tests
│   │       └── formatters/
│   │           ├── JsonFormatter.ts     # Format intermediate to JSON
│   │           ├── XmlFormatter.ts      # Format intermediate to XML
│   │           ├── StringFormatter.ts   # Format intermediate to delimited string
│   │           └── __tests__/           # Formatter unit tests
│   │
│   ├── common/                       # Shared Infrastructure
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts          # Global error handling middleware
│   │   │   └── requestLogger.ts         # Request/response logging middleware
│   │   ├── models/
│   │   │   └── serviceResponse.ts       # Standard response envelope
│   │   └── utils/
│   │       └── envConfig.ts             # Environment variable parsing
│   │
│   ├── api-docs/                     # OpenAPI Documentation
│   │   ├── openAPIRouter.ts             # Swagger UI setup & routing
│   │   ├── openAPIDocumentGenerator.ts  # OpenAPI schema generation
│   │   └── openAPIResponseBuilders.ts   # Response schema builders
│   │
│   ├── index.ts                      # Application entry point
│   └── server.ts                     # Express app setup & middleware config
│
├── Dockerfile                         # Container image specification
├── package.json                       # Project metadata & scripts
├── pnpm-lock.yaml                     # Locked dependency versions
├── tsconfig.json                      # TypeScript compiler configuration
├── vite.config.mts                    # Vitest testing configuration
└── README.md                          # This file
```

---

## API Documentation

### Interactive Swagger UI

Once the server is running, visit:

```
http://localhost:8080/api-docs
```

This provides an interactive interface to:

- Explore all available endpoints
- View request/response schemas in real-time
- Test API calls directly in the browser
- See validation rules for inputs
- Copy cURL commands for terminal usage

### Core Endpoints

#### 1. Health Check

**Purpose:** Verify the server is running and healthy (for monitoring, orchestration)

**Endpoint:** `GET /health-check`

**Response (200 OK):**

```json
{
  "status": "OK",
  "timestamp": "2025-11-26T10:30:00Z"
}
```

**Use cases:**

- Kubernetes liveness probes
- Load balancer health checks
- Monitoring systems (Datadog, New Relic)
- Docker health checks

#### 2. Transform Data

**Purpose:** Transform input data to the specified output format

**Endpoint:** `POST /transform?outputType=<format>&segmentDelineator=<char>&elementDelineator=<char>`

**Query Parameters:**

| Parameter           | Required | Type   | Example | Description                                         |
| ------------------- | -------- | ------ | ------- | --------------------------------------------------- |
| `outputType`        | ✅ Yes   | string | `json`  | Target format: `json`, `xml`, or `string`           |
| `segmentDelineator` | ❌ No    | string | `~`     | Character separating segments (for `string` format) |
| `elementDelineator` | ❌ No    | string | `*`     | Character separating elements (for `string` format) |

**Request Examples:**

```bash
# JSON to XML
curl -X POST "http://localhost:8080/transform?outputType=xml" \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "age": 30}'

# String to JSON (auto-detects input format)
curl -X POST "http://localhost:8080/transform?outputType=json" \
  -H "Content-Type: text/plain" \
  -d 'ProductID*1*2*3~AddressID*4*5~'

# JSON to delimited string with custom delimiters
curl -X POST "http://localhost:8080/transform?outputType=string&segmentDelineator=~&elementDelineator=*" \
  -H "Content-Type: application/json" \
  -d '{"ProductID": [{"ProductID1": "1", "ProductID2": "2"}]}'

# XML to JSON
curl -X POST "http://localhost:8080/transform?outputType=json" \
  -H "Content-Type: text/plain" \
  -d '<root><name>John</name><age>30</age></root>'
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "transformed": "output in requested format"
  }
}
```

**Error Responses:**

```json
{
  "status": 400,
  "error": "outputType query parameter is required."
}
```

**Common error codes:**

| Code | Reason                         | Fix                                                |
| ---- | ------------------------------ | -------------------------------------------------- |
| 400  | Missing `outputType` parameter | Add `?outputType=json` (or `xml`, `string`)        |
| 400  | Unable to detect input format  | Ensure request body has valid JSON/XML/string data |
| 400  | Unsupported format             | Check spelling of format (case-insensitive)        |
| 500  | Server error during transform  | Check logs, ensure data is well-formed             |

---

## Testing

### Running Tests

Execute all tests in the project:

```bash
pnpm test
```

This command:

- Runs all files matching `**/*.test.ts`
- Executes tests sequentially (not in parallel)
- Restores mocks between tests automatically
- Uses global test APIs (no imports needed)
- Exits with non-zero code if any tests fail
- Provides colored output with pass/fail indicators

**Watch mode (during development):**

```bash
pnpm test --watch
```

This reruns tests automatically when files change.

### Test Coverage

Generate a detailed coverage report:

```bash
pnpm test:cov
```

This command:

- Runs all tests with coverage instrumentation
- Generates coverage report in `/coverage` directory
- Displays coverage summary in terminal
- Creates HTML report for browser viewing

### Manual Testing

#### Using cURL

**1. Health Check:**

```bash
curl "http://localhost:8080/health-check"
```

**2. JSON to XML transformation:**

```bash
curl -X POST "http://localhost:8080/transform?outputType=xml" \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "name": "Alice",
      "email": "alice@example.com"
    }
  }'
```

Expected output: XML representation

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <user>
    <name>Alice</name>
    <email>alice@example.com</email>
  </user>
</root>
```

**3. String to JSON transformation:**

```bash
curl -X POST "http://localhost:8080/transform?outputType=json" \
  -H "Content-Type: text/plain" \
  -d 'ProductID*1*2*3~AddressID*4*5~'
```

Expected output:

```json
{
  "ProductID": [
    {
      "ProductID1": "1",
      "ProductID2": "2",
      "ProductID3": "3"
    }
  ],
  "AddressID": [
    {
      "AddressID1": "4",
      "AddressID2": "5"
    }
  ]
}
```

**4. Custom delimiters:**

```bash
curl -X POST "http://localhost:8080/transform?outputType=string&segmentDelineator=|&elementDelineator=," \
  -H "Content-Type: application/json" \
  -d '{
    "record": [
      {"field1": "a", "field2": "b"}
    ]
  }'
```

---

## Example Data Formats

### String Format (Delimited)

**String Format:**

```
ProductID*4*8*15*16*23~
ProductID*a*b*c*d*e~
AddressID*42*108*3*14~
ContactID*59*26~
```

**Structure explanation:**

- Each line is a **segment** (terminated by `~`)
- Each value within a segment is an **element** (separated by `*`)
- First element is the **key/identifier**
- Remaining elements are **data values**

**Default delimiters:**

- Element separator: `*`
- Segment separator: `~`

**Custom delimiters example:**

```
ProductID,4,8,15|AddressID,42,108|
```

With `elementDelineator=,` and `segmentDelineator=|`

### JSON Format

**JSON representation of string data above:**

```json
{
  "ProductID": [
    {
      "ProductID1": "4",
      "ProductID2": "8",
      "ProductID3": "15",
      "ProductID4": "16",
      "ProductID5": "23"
    },
    {
      "ProductID1": "a",
      "ProductID2": "b",
      "ProductID3": "c",
      "ProductID4": "d",
      "ProductID5": "e"
    }
  ],
  "AddressID": [
    {
      "AddressID1": "42",
      "AddressID2": "108",
      "AddressID3": "3",
      "AddressID4": "14"
    }
  ],
  "ContactID": [
    {
      "ContactID1": "59",
      "ContactID2": "26"
    }
  ]
}
```

**Key observations:**

- Each unique segment name becomes a top-level key
- Values for each segment become an array of objects
- Each object has keys like `ProductID1`, `ProductID2`, etc.
- All values are strings

### XML Format

**XML representation:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <ProductID>
    <item>
      <ProductID1>4</ProductID1>
      <ProductID2>8</ProductID2>
      <ProductID3>15</ProductID3>
      <ProductID4>16</ProductID4>
      <ProductID5>23</ProductID5>
    </item>
    <item>
      <ProductID1>a</ProductID1>
      <ProductID2>b</ProductID2>
      <ProductID3>c</ProductID3>
      <ProductID4>d</ProductID4>
      <ProductID5>e</ProductID5>
    </item>
  </ProductID>
  <AddressID>
    <item>
      <AddressID1>42</AddressID1>
      <AddressID2>108</AddressID2>
      <AddressID3>3</AddressID3>
      <AddressID4>14</AddressID4>
    </item>
  </AddressID>
  <ContactID>
    <item>
      <ContactID1>59</ContactID1>
      <ContactID2>26</ContactID2>
    </item>
  </ContactID>
</root>
```
