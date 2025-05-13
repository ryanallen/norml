# NORML App

## Testing

To test database connection:
```bash
npm test
```

If successful, you'll see:
```
Connecting to database...
Connected to database ✓
Status check successful
✔ Database connection (650ms)
ℹ tests 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 829ms
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

