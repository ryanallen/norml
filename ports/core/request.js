// Generic request handling port
import { EventPort } from '../interfaces/ports.js';

export class RequestPort {
  constructor(eventHandler) {
    if (!(eventHandler instanceof EventPort)) {
      throw new Error('Invalid event handler: must implement EventPort');
    }
    this.eventHandler = eventHandler;
  }

  async handleRequest(req) {
    try {
      await this.validateRequest(req);
      return await this.processRequest(req);
    } catch (error) {
      this.eventHandler.onError(error);
      throw error;
    }
  }

  async validateRequest(req) {
    if (!req.method) {
      throw new Error('Request method is required');
    }
    if (!req.url) {
      throw new Error('Request URL is required');
    }
  }

  async processRequest(req) {
    // Base implementation - override in specific request handlers
    return {
      method: req.method,
      url: req.url,
      headers: req.headers,
      timestamp: new Date().toISOString()
    };
  }
} 