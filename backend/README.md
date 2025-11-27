# Editor de Música Cifrada - Backend API

Backend REST API for the Editor de Música Cifrada application - a comprehensive music chord catalog system.

## Features

- Song management with lyrics and chords
- Playlist creation and management
- User authentication and authorization
- Song sharing capabilities
- Export functionality (PDF, text)
- Category-based organization
- Automatic chord transposition
- Advanced search functionality

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Architecture**: REST API
- **Data Storage**: In-memory (arrays/objects)

## Project Structure

```
src/
├── api/                    # API controllers
│   └── v1/                 # API version 1
│       ├── external/       # Public endpoints
│       └── internal/       # Authenticated endpoints
├── routes/                 # Route definitions
│   └── v1/                 # Version 1 routes
├── middleware/             # Express middleware
├── services/               # Business logic
├── utils/                  # Utility functions
├── constants/              # Application constants
├── instances/              # Service instances
├── config/                 # Configuration
└── server.ts               # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`

### Development

Run the development server with hot reload:

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/v1`

### Building for Production

Build the TypeScript code:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## API Documentation

### Base URL

- Development: `http://localhost:3000/api/v1`
- Production: `https://api.yourdomain.com/api/v1`

### Endpoints

#### Health Check

```
GET /health
```

Returns server health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "editor-musica-cifrada-api"
}
```

### External Routes (Public)

```
/api/v1/external/*
```

Public endpoints that don't require authentication.

### Internal Routes (Authenticated)

```
/api/v1/internal/*
```

Protected endpoints requiring user authentication.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `API_VERSION` | API version | `v1` |
| `CORS_ORIGINS` | Allowed CORS origins | `localhost:3000,localhost:5173` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `10` |
| `CACHE_TTL` | Cache time-to-live (seconds) | `3600` |
| `CACHE_CHECK_PERIOD` | Cache check interval (seconds) | `600` |

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use 2-space indentation
- Maximum line length: 120 characters
- Use single quotes for strings

### Naming Conventions

- Files: camelCase (e.g., `userService.ts`)
- API routes: kebab-case (e.g., `/song-management`)
- Functions: camelCase with action verbs
- Types/Interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE

### API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {},
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Testing

Test files should be colocated with source files:

```
src/services/song/
├── songLogic.ts
├── songLogic.test.ts
└── songTypes.ts
```

## License

ISC

## Support

For issues and questions, please open an issue in the repository.