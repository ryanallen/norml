import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { Router } from '../../ports/router.js';

test('Router', async (t) => {
  await t.test('should add and match routes', async () => {
    const router = new Router();
    let handlerCalled = false;

    router.addRoute('GET', '/test', () => {
      handlerCalled = true;
      return true;
    });

    const req = {
      method: 'GET',
      url: '/test',
      headers: { host: 'localhost' }
    };

    const res = {};

    const handled = await router.route(req, res);
    assert.equal(handled, true);
    assert.equal(handlerCalled, true);
  });

  await t.test('should handle unknown routes', async () => {
    const router = new Router();
    const req = {
      method: 'GET',
      url: '/unknown',
      headers: { host: 'localhost' }
    };

    const res = {};

    const handled = await router.route(req, res);
    assert.equal(handled, false);
  });

  await t.test('should handle different HTTP methods', async () => {
    const router = new Router();
    let getHandlerCalled = false;
    let postHandlerCalled = false;

    router.addRoute('GET', '/api', () => {
      getHandlerCalled = true;
      return true;
    });

    router.addRoute('POST', '/api', () => {
      postHandlerCalled = true;
      return true;
    });

    // Test GET request
    await router.route({
      method: 'GET',
      url: '/api',
      headers: { host: 'localhost' }
    }, {});

    // Test POST request
    await router.route({
      method: 'POST',
      url: '/api',
      headers: { host: 'localhost' }
    }, {});

    assert.equal(getHandlerCalled, true);
    assert.equal(postHandlerCalled, true);
  });
}); 