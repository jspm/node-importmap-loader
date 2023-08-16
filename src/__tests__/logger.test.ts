import { logger } from '../logger';

test('logger works', () => {
  const mockDebug = jest.spyOn(console, 'debug');
  const mockError = jest.spyOn(console, 'error');
  const log = logger({ file: 'test', isLogging: true });
  log.debug('debug');
  log.error('error');
  expect(mockDebug).toBeCalledWith('jspm:[test]: debug');
  expect(mockError).toBeCalledWith('jspm:[test]: error');
})
