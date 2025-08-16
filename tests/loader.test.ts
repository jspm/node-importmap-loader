import { describe, test, afterEach } from 'node:test';
import assert from 'node:assert';
import sinon from 'sinon';
import { resolve } from '../src/loader';

describe('loader', () => {
  afterEach(() => {
    sinon.restore();
  });

  test('resolved with basic config', async () => {
    const nextResolve = sinon.stub().resolves({ url: 'resolved-url' });
    const specifier = 'specifier';
    const context = { parentURL: 'parentURL' };
    
    const result = await resolve(specifier, context, nextResolve);
    
    assert.strictEqual(nextResolve.calledOnce, true);
    assert.strictEqual(nextResolve.firstCall.args[0], 'specifier');
  });

  test('returns nextResolve when no parentURL', async () => {
    const nextResolve = sinon.stub().resolves({ url: 'resolved-url' });
    const specifier = 'test-module';
    const context = {};
    
    await resolve(specifier, context, nextResolve);
    
    assert.strictEqual(nextResolve.calledOnce, true);
    assert.strictEqual(nextResolve.firstCall.args[0], 'test-module');
  });

  test('returns nextResolve when parentURL is undefined', async () => {
    const nextResolve = sinon.stub().resolves({ url: 'resolved-url' });
    const specifier = 'test-module';
    const context = { parentURL: undefined };
    
    await resolve(specifier, context, nextResolve);
    
    assert.strictEqual(nextResolve.calledOnce, true);
    assert.strictEqual(nextResolve.firstCall.args[0], 'test-module');
  });

  test('handles node: protocol specifiers', async () => {
    const nextResolve = sinon.stub().resolves({ url: 'node:fs' });
    const specifier = 'node:fs';
    const context = { parentURL: 'file:///project/index.js' };
    
    await resolve(specifier, context, nextResolve);
    
    assert.strictEqual(nextResolve.calledOnce, true);
    assert.strictEqual(nextResolve.firstCall.args[0], 'node:fs');
  });

  test('handles file: protocol specifiers', async () => {
    const nextResolve = sinon.stub().resolves({ url: 'file:///path/to/file.js' });
    const specifier = 'file:///path/to/file.js';
    const context = { parentURL: 'file:///project/index.js' };
    
    await resolve(specifier, context, nextResolve);
    
    assert.strictEqual(nextResolve.calledOnce, true);
    assert.strictEqual(nextResolve.firstCall.args[0], 'file:///path/to/file.js');
  });

  test('handles relative path specifiers', async () => {
    const nextResolve = sinon.stub().resolves({ url: 'file:///project/module.js' });
    const specifier = './module.js';
    const context = { parentURL: 'file:///project/index.js' };
    
    await resolve(specifier, context, nextResolve);
    
    assert.strictEqual(nextResolve.calledOnce, true);
    assert.strictEqual(nextResolve.firstCall.args[0], './module.js');
  });

  test('handles npm package specifiers', async () => {
    const nextResolve = sinon.stub().resolves({ url: 'resolved-package' });
    const specifier = 'lodash';
    const context = { parentURL: 'file:///project/index.js' };
    
    await resolve(specifier, context, nextResolve);
    
    assert.strictEqual(nextResolve.calledOnce, true);
  });

  test('handles scoped npm packages', async () => {
    const nextResolve = sinon.stub().resolves({ url: 'resolved-package' });
    const specifier = '@babel/core';
    const context = { parentURL: 'file:///project/index.js' };
    
    await resolve(specifier, context, nextResolve);
    
    assert.strictEqual(nextResolve.calledOnce, true);
  });

  test('handles deep imports from packages', async () => {
    const nextResolve = sinon.stub().resolves({ url: 'resolved-package' });
    const specifier = 'lodash/debounce';
    const context = { parentURL: 'file:///project/index.js' };
    
    await resolve(specifier, context, nextResolve);
    
    assert.strictEqual(nextResolve.calledOnce, true);
  });
});