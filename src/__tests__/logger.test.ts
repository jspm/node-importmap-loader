import { logger } from '../logger';

test('logger works', () => {
  const mockDebug = jest.spyOn(console, 'debug');
  const mockError = jest.spyOn(console, 'error');
  const mockInfo = jest.spyOn(console, 'info');
  const log = logger({ file: 'test', isLogging: true });
  log.debug('debug');
  log.error('error');
  log.info('info');
  expect(mockDebug).toBeCalledWith('jspm:[test]: debug');
  expect(mockError).toBeCalledWith('jspm:[test]: error');
  expect(mockInfo).toBeCalledWith('jspm:[test]: info');
})
