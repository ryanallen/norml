import { Presenter } from '../ports/interfaces.js';

export class DbStatusPresenter extends Presenter {
  format(status) {
    console.log('[DB Presenter] Formatting status:', status);
    
    // Format basic connection status
    const baseStatus = {
      status: status.connected ? 'available' : 'unavailable',
      time: status.timestamp,
      connection: {
        poolSize: status.poolSize || 0,
        availableConnections: status.available || 0,
        isConnected: status.connected || false
      }
    };

    // Add ping information if available
    if (status.ping) {
      baseStatus.ping = {
        success: status.ping.success,
        latencyMs: status.ping.latency
      };
    }

    // Add server stats if available
    if (status.stats) {
      baseStatus.server = {
        version: status.stats.version,
        uptime: this.formatUptime(status.stats.uptime),
        connections: status.stats.connections,
        memory: this.formatMemory(status.stats.memory)
      };
    }

    // Add error information if present
    if (status.lastError) {
      baseStatus.lastError = {
        message: status.lastError.message,
        time: status.lastError.timestamp || status.timestamp
      };
    }

    return baseStatus;
  }

  formatError(error) {
    console.log('[DB Presenter] Formatting error:', error);
    return {
      status: 'error',
      message: error.message,
      time: new Date().toISOString()
    };
  }

  present(res, status) {
    console.log('[DB Presenter] Presenting status');
    const code = status.connected ? 200 : 503;
    res.writeHead(code, { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify(this.format(status)));
  }

  presentError(res, error) {
    console.log('[DB Presenter] Presenting error');
    res.writeHead(503, { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify(this.formatError(error)));
  }

  // Helper methods
  formatUptime(seconds) {
    if (!seconds) return 'unknown';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.join(' ') || '< 1m';
  }

  formatMemory(mem) {
    if (!mem) return {};
    return {
      resident: this.formatBytes(mem.resident),
      virtual: this.formatBytes(mem.virtual),
      mapped: this.formatBytes(mem.mapped)
    };
  }

  formatBytes(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return `${Math.round(value * 100) / 100} ${units[unitIndex]}`;
  }
}

export const presenter = new DbStatusPresenter(); 