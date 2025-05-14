// MongoDB request handling port
import { MongoDBValidationPort } from './interfaces.js';

export class MongoDBRequestPort {
  constructor(validator) {
    if (!(validator instanceof MongoDBValidationPort)) {
      throw new Error('Invalid validator: must implement MongoDBValidationPort');
    }
    this.validator = validator;
  }

  async handleConnect(req) {
    const options = {
      host: req.body?.host,
      port: req.body?.port,
      database: req.body?.database,
      username: req.body?.username,
      password: req.body?.password
    };

    this.validator.validateConnection(options);
    return options;
  }

  async handleQuery(req) {
    const query = {
      collection: req.body?.collection,
      operation: req.body?.operation,
      filter: req.body?.filter,
      update: req.body?.update,
      options: req.body?.options
    };

    this.validator.validateQuery(query);
    return query;
  }

  async handleResult(result) {
    this.validator.validateResult(result);
    return result;
  }

  parseRequest(req) {
    return {
      operation: req.url.split('/').pop(),
      method: req.method,
      body: req.body || {},
      headers: req.headers || {}
    };
  }
} 