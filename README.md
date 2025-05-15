# NORML App

**[Live Status Page →](https://norml.ai)**

A Node.js application implementing RHOMBUS architecture:
- **R**estful APIs
- **H**exagonal ports & adapters
- **O**ptimal test coverage
- **M**icroservices
- **B**ackend logic isolation
- **U**I presenters
- **S**hipping continuously

## Quick Start

```bash
# Clean install dependencies (recommended for reproducible builds)
npm ci

# Start the application
npm start
```

> Note: We use `npm ci` instead of `npm install` to ensure consistent installations across all environments. This command is faster and more reliable as it strictly follows the package-lock.json file.

## Architecture Overview

Core principles of RHOMBUS:

1. Zero external dependencies
   - Using only Node.js built-in modules
   - Implementing all functionality from scratch
   - No external libraries or frameworks
   - Pure, maintainable, and fully controlled implementations

2. Minimal code
   - Every line must have clear purpose
   - No boilerplate or framework overhead
   - Small, focused implementations
   - If it's not needed, it's not there

### Directory Structure
```
/app
  /adapters     # Implements interfaces defined in ports
    /cloud      # Cloud service adapters (GCP, etc.)
    /db         # Database adapters
    /env        # Environment configuration
    /static     # Static file handling
    /test       # Test utilities
    /version    # Version information
  /logic        # Contains business rules and domain logic
    /db         # Database-related business logic
    /static     # Static file business logic
    /tools      # Utility tools
    /version    # Version-related business logic
  /ports        # Defines interfaces and handles HTTP
    /api        # API endpoints
    /core       # Core components (server, router, headers, etc.)
    /db         # Database-related ports
    /interfaces # Interface definitions
    /static     # Static file handling ports
  /presenters   # Formats data for display (NO business logic)
    /api        # API response formatting
    /db         # Database response formatting
    /html       # HTML formatting
    /main       # Main page formatting
    /static     # Static file formatting
```

### Layer Responsibilities

1. **Ports Layer**
   - Defines interfaces that adapters must implement
   - Handles HTTP requests and routing
   - Orchestrates flow between logic, adapters, and presenters
   - **Implemented as TypeScript interfaces for compile-time type safety**

2. **Logic Layer**
   - Contains all business rules and validation
   - Pure business logic with no external dependencies
   - Called by ports to execute business rules

3. **Adapters Layer**
   - Implements interfaces defined in ports
   - Handles external service communication (DB, APIs)
   - Converts external data to internal format

4. **Presenters Layer**
   - ONLY formats data for display
   - NO business logic or validation
   - Simple transformation of data to view format

### Request Flow
1. Port receives HTTP request
2. Port calls Logic for business rules/validation
3. Port uses Adapter for external services if needed
4. Port uses Presenter to format response
5. Port sends formatted response

## Best Practices

### Restful APIs
- OpenAPI/Swagger documentation for all endpoints
- Standard REST router enforcing conventions
- Built-in API versioning
- Consistent response formats

### Hexagonal Architecture
- Dependency injection between layers
- Interface contracts in ports layer
- Strict separation of concerns
- Code review checklist for architectural compliance

Our implementation follows the ports and adapters pattern:

1. **Ports (Interfaces)**: Define contracts in `ports/interfaces/ports.js`.
   - `DatabasePort`, `VersionPort`, `StaticFilePort`, etc.
   - These interfaces define what adapters must implement.

2. **Core Components**: Common infrastructure in `ports/core/`.
   - Server, Router, Headers, Request/Response handling

3. **Adapters**: Concrete implementations of interfaces.
   - Database adapters connect to MongoDB 
   - File adapters provide file system access
   - Cloud adapters connect to GCP services

4. **Domain Logic**: Business rules in the `logic` directory.
   - No dependencies on external frameworks
   - Pure business logic with clear responsibilities

5. **Presenters**: Format data for different views.
   - HTML for browser viewing
   - JSON for API responses
   - No business logic, only formatting

### Optimal Test Coverage
- Integration tests for layer boundaries
- E2E tests for critical paths
- Unit tests for business logic

> Important: Tests must use real implementations, not mocks or stubs. All tests run against:
> - Actual database connections
> - Live API endpoints
> - Real cloud services
> - Production external dependencies
> Mock implementations do not provide meaningful test coverage.

### Microservices
- Independent service repositories
- Service mesh for inter-service communication
- Health checks and circuit breakers
- API gateway for routing
- Independent deployability

### Backend Logic
- Pure functions where possible
- Domain events for side effects
- No framework dependencies in logic layer
- Clear business rule implementation
- Framework-independent code

### UI Presenters
- Small, focused presenter classes
- Only format/transform methods
- Clear interface inheritance
- No business logic

### Shipping Continuously
- Feature flags for deployment control
- Automated staging environment
- Monitoring and alerts
- Rolling updates
- Zero-downtime deployment

## Development Guidelines

### Code Review Checklist
- Verify layer separation
- Check import directions
- Ensure no business logic in presenters
- Validate REST endpoint patterns
- Verify tests use real implementations

### Architecture Reviews
- Regular team reviews
- Update patterns as needed
- Document decisions
- Maintain clean boundaries

### Testing
```bash
npm test
```

Tests run automatically on GitHub Actions for all pull requests and pushes to main branch.

## Deployment

This application is automatically deployed to Google App Engine when changes are pushed to the main branch.

### Required GitHub Secrets

The following secrets must be configured in the GitHub repository settings:

1. `DEPLOY_TO_GCP`: Service account credentials JSON for deploying to Google Cloud
2. `MONGO_URI`: MongoDB connection string in the format `mongodb+srv://username:password@hostname/database?options`
3. `API_BASE`: Base URL for API endpoints (e.g., `https://norml-459701.uc.r.appspot.com`)

These secrets are used by the GitHub Actions workflow to deploy the application securely without exposing sensitive information in the repository. 
