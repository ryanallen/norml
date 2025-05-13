# norml

## RHOMBIC Architecture
- **R**ESTful API design
- **H**exagonal core architecture
- **O**rthogonal UI
- **M**icroservices architecture
- **B**usiness logic isolation
- **I**ntegrated testing
- **C**ontinuous deployment

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