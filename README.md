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

