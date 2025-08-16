import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseArgs } from '../src/parseArgs';

describe('parseArgs', () => {

  it('returns empty object if no args', () => {
    assert.deepStrictEqual(parseArgs({ args: [], options: {} }), {});
  });

  it('returns parsed boolean arg', () => {
    const options = {
      'test': { type: 'boolean' }
    };
    assert.deepStrictEqual(parseArgs({ args: ['test'], options }), { test: true });
  });

  it('returns parsed boolean arg with default false', () => {
    const options = {
      'test': { type: 'boolean', default: false }
    };
    assert.deepStrictEqual(parseArgs({ args: ['test'], options }), { test: true });
  });

  it('uses alias if provided', () => {
    const options = {
      'test': { alias: 't', type: 'boolean' }
    };
    assert.deepStrictEqual(parseArgs({ args: ['t'], options }), { test: true });
  });

});