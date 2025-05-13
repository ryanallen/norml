// Test response utility that implements http.ServerResponse interface
export class TestResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this.body = '';
  }

  writeHead(statusCode, headers) {
    this.statusCode = statusCode;
    this.headers = headers;
    return this;
  }

  end(body) {
    this.body = body;
    return this;
  }

  getBodyJson() {
    return JSON.parse(this.body);
  }
} 