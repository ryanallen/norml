# NORML App

## Testing

To test MongoDB connection:
```bash
npm test
```

If successful, you'll see:
```
Connecting to MongoDB...
Connected to MongoDB ✓
Server: ac-mudywoz-shard-00-02.tlxea13.mongodb.net:27017
✔ MongoDB connection (650.8167ms)
ℹ tests 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 829.9972
```

Tests automatically run on GitHub Actions for all pull requests and pushes to main branch.

## RHOMBUS Architecture
- **R**estful APIs
- **H**exagonal ports & adapters
- **O**ptimal test coverage
- **M**icroservices
- **B**ackend logic isolation
- **U**I presenters
- **S**hipping continuously

## Our Approach

We follow RHOMBUS with minimal dependencies:
- Built our own HTTP server instead of Express
- Only use MongoDB and dotenv
- Everything else is Node.js standard library

This keeps things simple and maintainable.

## Architecture Details

We follow the RHOMBUS architecture pattern:

```
app/
├── adapters/     # Talk to external systems (MongoDB)
├── ports/        # Handle incoming/outgoing traffic (HTTP)
├── logic/        # Core business rules and routing decisions
└── presenters/   # Format data for display
```

### Why RHOMBUS?

- **Clean Separation**: Each layer has a single responsibility
- **Testable**: Business logic is separate from external dependencies
- **Flexible**: Easy to swap out implementations (e.g., database, web framework)

### Minimalist Approach

We deliberately avoid unnecessary dependencies:

- No Express.js - Built our own minimal HTTP server using Node's `http` module
- No middleware stack - Direct request handling with clear flow
- No complex routing - Simple, explicit URL handling
- No template engine - Basic HTML/JS for the frontend

### Example: Database Status Check

Here's how a request flows through our architecture:

1. **Port** (`ports/server.js`): Receives HTTP request from browser
2. **Port** (`ports/db-status.js`): Handles /db endpoint
3. **Logic** (`logic/db-status.js`): Checks if database is working
4. **Adapter** (`adapters/db.js`): Talks to MongoDB
5. **Presenter** (`presenters/db-status.js`): Formats response for browser

## Getting Started

```bash
# Install minimal dependencies
npm install

# Run tests
npm test

# Start server
npm start
```

## Dependencies

We keep it lean:
- `mongodb`: For database connectivity
- `dotenv`: For environment variables

That's it! Everything else is built using Node.js standard library.