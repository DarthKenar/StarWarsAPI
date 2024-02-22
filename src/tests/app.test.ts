// app.test.ts
import { prueba } from '../build/app';

test('adds 1 + 2 to equal 3', () => {
  expect(prueba(1, 2)).toBe(3);
});