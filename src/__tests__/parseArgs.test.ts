import { parseArgs } from '../parseArgs';

describe('parseArgs', () => {

  it('returns empty object if no args', () => {
    expect(parseArgs({ args: [], options: {} })).toEqual({});
  });

  it('returns parsed boolean arg', () => {
    const options = {
      'test': { type: 'boolean' }
    };
    expect(parseArgs({ args: ['test'], options })).toEqual({ test: false });
  });

  it('returns parsed boolean arg with default false', () => {
    const options = {
      'test': { type: 'boolean', default: false }
    };
    expect(parseArgs({ args: ['test'], options })).toEqual({ test: false });
  });

  it.only('uses alias if provided', () => {
    const options = {
      'test': { alias: 't', type: 'boolean' }
    };
    expect(parseArgs({ args: ['t'], options })).toEqual({ test: true });
  });

});
