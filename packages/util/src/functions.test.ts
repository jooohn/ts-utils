import { compose, identity } from './functions';

describe('identity', () => {
  [1, 'abc', true, {}].forEach(value => {
    it(`returns same value for ${value}`, () => {
      const actual = identity(value);
      expect(actual).toBe(value);
    });
  });
});

describe('compose', () => {
  const f: (a: string) => string = str => `f applied to (${str})`;
  const g: (b: string) => string = str => `g applied to (${str})`;
  const composed = compose(f, g);

  it('creates new function which applies f and g sequentially', () => {
    const actual = composed('STRING');
    expect(actual).toBe('g applied to (f applied to (STRING))');
  });
});
