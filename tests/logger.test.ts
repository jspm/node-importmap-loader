import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert';
import sinon from 'sinon';
import { logger } from '../src/logger';

describe('logger', () => {
  afterEach(() => {
    sinon.restore();
  });

  test('logger works with logging enabled', () => {
    const mockDebug = sinon.stub(console, 'debug');
    const mockError = sinon.stub(console, 'error');
    
    const log = logger({ file: 'test', isLogging: true });
    log.debug('debug message');
    log.error('error message');
    
    assert.strictEqual(mockDebug.calledWith('jspm:[test]: debug message'), true);
    assert.strictEqual(mockError.calledWith('jspm:[test]: error message'), true);
  });

  test('logger does not log debug when logging is disabled', () => {
    const mockDebug = sinon.stub(console, 'debug');
    const mockError = sinon.stub(console, 'error');
    
    const log = logger({ file: 'test', isLogging: false });
    log.debug('debug message');
    log.error('error message');
    
    assert.strictEqual(mockDebug.called, false);
    assert.strictEqual(mockError.calledWith('jspm:[test]: error message'), true);
  });

  test('logger handles multiple arguments', () => {
    const mockDebug = sinon.stub(console, 'debug');
    const mockError = sinon.stub(console, 'error');
    
    const log = logger({ file: 'test-file', isLogging: true });
    log.debug('message', { data: 'value' }, 123);
    log.error('error occurred', new Error('test error'));
    
    assert.strictEqual(mockDebug.calledWith('jspm:[test-file]: message', { data: 'value' }, 123), true);
    assert.strictEqual(mockError.calledOnce, true);
    assert.strictEqual(mockError.firstCall.args[0], 'jspm:[test-file]: error occurred');
  });

  test('logger uses correct file prefix', () => {
    const mockDebug = sinon.stub(console, 'debug');
    
    const log1 = logger({ file: 'loader', isLogging: true });
    const log2 = logger({ file: 'parser', isLogging: true });
    const log3 = logger({ file: 'utils', isLogging: true });
    
    log1.debug('loader message');
    log2.debug('parser message');
    log3.debug('utils message');
    
    assert.strictEqual(mockDebug.calledWith('jspm:[loader]: loader message'), true);
    assert.strictEqual(mockDebug.calledWith('jspm:[parser]: parser message'), true);
    assert.strictEqual(mockDebug.calledWith('jspm:[utils]: utils message'), true);
  });

  test('logger error method always logs regardless of isLogging flag', () => {
    const mockError = sinon.stub(console, 'error');
    
    const log = logger({ file: 'test', isLogging: false });
    log.error('critical error');
    
    assert.strictEqual(mockError.calledWith('jspm:[test]: critical error'), true);
  });

  test('logger handles undefined and null values', () => {
    const mockDebug = sinon.stub(console, 'debug');
    const mockError = sinon.stub(console, 'error');
    
    const log = logger({ file: 'test', isLogging: true });
    log.debug(undefined);
    log.debug(null);
    log.error(undefined);
    log.error(null);
    
    assert.strictEqual(mockDebug.calledWith('jspm:[test]: undefined'), true);
    assert.strictEqual(mockDebug.calledWith('jspm:[test]: null'), true);
    assert.strictEqual(mockError.calledWith('jspm:[test]: undefined'), true);
    assert.strictEqual(mockError.calledWith('jspm:[test]: null'), true);
  });

  test('logger handles empty strings', () => {
    const mockDebug = sinon.stub(console, 'debug');
    
    const log = logger({ file: 'test', isLogging: true });
    log.debug('');
    
    assert.strictEqual(mockDebug.calledWith('jspm:[test]: '), true);
  });

  test('logger handles objects and arrays', () => {
    const mockDebug = sinon.stub(console, 'debug');
    
    const log = logger({ file: 'test', isLogging: true });
    const testObj = { key: 'value', nested: { prop: 123 } };
    const testArr = [1, 2, 3, 'four'];
    
    log.debug('object:', testObj);
    log.debug('array:', testArr);
    
    assert.strictEqual(mockDebug.calledWith('jspm:[test]: object:', testObj), true);
    assert.strictEqual(mockDebug.calledWith('jspm:[test]: array:', testArr), true);
  });
});