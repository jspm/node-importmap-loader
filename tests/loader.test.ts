import { test, expect } from 'vitest'

import { constructPath } from "../loader"

test('constructPath', () => {
  const result = constructPath('foo')
  expect(result).toBe('foo')
});
