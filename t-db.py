"""
Test MongoDB connection
"""
import sys
from db import connect

print('Connecting to MongoDB...')
try:
    client = connect()
    # Test connection with ping
    client.admin.command('ping')
    print('Connected to MongoDB ✓')
    
    # Get connection info
    connection_info = client.address
    server = connection_info[0] if connection_info else "unknown"
    
    print(f'Server: {server}')
    client.close()
    print('Connection closed ✓')
    sys.exit(0)
except Exception as e:
    print('Connection failed ✗')
    print(f'Error: {str(e)}')
    sys.exit(1) 