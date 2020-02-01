import { NonEmptyList } from './nel';

describe('NonEmptyList', () => {
  let sampleNel: NonEmptyList<number>;

  beforeEach(() => {
    sampleNel = NonEmptyList.of(1, [2, 3, 4]);
  });

  describe('#of', () => {
    it('creates new NEL', () => {
      const nel = NonEmptyList.of(1, [2, 3, 4]);
      assertEqualAsArray(nel, [1, 2, 3, 4]);
    });

    it('creates new NEL with default empty tail', () => {
      const nel = NonEmptyList.of(1);
      assertEqualAsArray(nel, [1]);
    });
  });

  describe('map', () => {
    it('returns f applied NEL', () => {
      const actual = sampleNel.map(n => n * 2);
      assertEqualAsArray(actual, [2, 4, 6, 8]);
    });
  });

  describe('flatMap', () => {
    it('returns f applied flatten NEL', () => {
      const actual = sampleNel.flatMap(n => NonEmptyList.of(n, [n]));
      assertEqualAsArray(actual, [1, 1, 2, 2, 3, 3, 4, 4]);
    });
  });

  describe('concat', () => {
    it('returns combined NEL', () => {
      const actual = sampleNel.concat(sampleNel);
      assertEqualAsArray(actual, [1, 2, 3, 4, 1, 2, 3, 4]);
    });

    it('keeps original value pure', () => {
      sampleNel.concat(sampleNel);
      assertEqualAsArray(sampleNel, [1, 2, 3, 4]);
    });
  });

  describe('concatWithArray', () => {
    it('returns combined NEL', () => {
      const actual = sampleNel.concatWithArray([1, 2, 3, 4]);
      assertEqualAsArray(actual, [1, 2, 3, 4, 1, 2, 3, 4]);
    });

    it('keeps original value pure', () => {
      sampleNel.concatWithArray([1, 2, 3, 4]);
      assertEqualAsArray(sampleNel, [1, 2, 3, 4]);
    });
  });

  describe('filter', () => {
    it('returns an Array filtered by predicate function', () => {
      const actual = sampleNel.filter(n => n % 2 === 0);
      expect(actual).toEqual([2, 4]);
    });
  });

  describe('fold', () => {
    it('folds items applying f for each item and initial value', () => {
      const actual = sampleNel.fold((acc, n) => `${acc}-${n}`, 'init');
      expect(actual).toEqual('init-1-2-3-4');
    });
  });

  describe('reduce', () => {
    it('reduces items applying f for each item', () => {
      const actual = sampleNel.reduce((a, b) => a * b);
      expect(actual).toEqual(24);
    });
  });

  describe('every', () => {
    it('returns true if predicate function applies for each item', () => {
      const actual = sampleNel.every(n => n <= 4);
      expect(actual).toEqual(true);
    });

    it('returns false if predicate function does not apply for some of the items', () => {
      const actual = sampleNel.every(n => n % 2 === 0);
      expect(actual).toEqual(false);
    });
  });

  describe('some', () => {
    it('returns true if predicate function applies some of the items', () => {
      const actual = sampleNel.some(n => n % 2 === 0);
      expect(actual).toEqual(true);
    });

    it('returns false if predicate function applies none of the items', () => {
      const actual = sampleNel.some(n => n > 4);
      expect(actual).toEqual(false);
    });
  });

  describe('find', () => {
    it('returns first item that predicate function applies', () => {
      const actual = sampleNel.find(n => n % 2 === 0);
      expect(actual).toEqual(2);
    });

    it('returns undefined if predicate function applies none of the items', () => {
      const actual = sampleNel.find(n => n > 4);
      expect(actual).toBeUndefined();
    });
  });

  describe('findIndex', () => {
    it('returns first index of an item that predicate function applies', () => {
      const actual = sampleNel.findIndex(n => n % 2 === 0);
      expect(actual).toEqual(1);
    });

    it('returns -1 if predicate function applies none of the items', () => {
      const actual = sampleNel.findIndex(n => n > 4);
      expect(actual).toBe(-1);
    });
  });

  describe('includes', () => {
    it('returns true if the target item is found', () => {
      const actual = sampleNel.includes(3);
      expect(actual).toBe(true);
    });

    it('returns false if the target item is not found', () => {
      const actual = sampleNel.includes(0);
      expect(actual).toBe(false);
    });
  });

  describe('join', () => {
    it('builds concatenated string', () => {
      const actual = sampleNel.join('-');
      expect(actual).toEqual('1-2-3-4');
    });

    it('builds concatenated string with default "," separator', () => {
      const actual = sampleNel.join();
      expect(actual).toEqual('1,2,3,4');
    });
  });

  describe('forEach', () => {
    it('executes f for each item', () => {
      const ret: number[] = [];
      sampleNel.forEach(n => ret.push(n));
      expect(ret).toEqual([1, 2, 3, 4]);
    });
  });

  function assertEqualAsArray<A>(actual: NonEmptyList<A>, expected: A[]) {
    expect(actual.toArray()).toEqual(expected);
  }
});
