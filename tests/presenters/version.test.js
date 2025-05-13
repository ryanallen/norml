import { describe, it } from 'node:test';
import assert from 'node:assert';
import { presenter } from '../../presenters/version.js';

describe('VersionPresenter', () => {
  it('formats version', () => {
    assert.deepStrictEqual(presenter.format('1.0.0'), {
      version: '1.0.0'
    });
  });

  it('formats error', () => {
    const error = new Error('Version not found');
    
    assert.deepStrictEqual(presenter.formatError(error), {
      error: 'Version not found'
    });
  });
}); 