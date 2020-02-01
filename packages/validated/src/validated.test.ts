import { NonEmptyList } from './nel';
import { invalid, invalidUnit, mapN, valid, validateAll, Validated } from './validated';

describe('Validated', () => {
  function assertIsValid<A>(actual: Validated<any, A>, value: A) {
    expect(
      actual.fold(
        v => v,
        es => {
          throw new Error(`Invalid(${es}) is not equal to Valid(${value})`);
        },
      ),
    ).toEqual(value);
  }

  function assertIsInvalid<E>(actual: Validated<E, any>, es: E[]) {
    expect(
      actual.fold(
        v => {
          throw new Error(`Valid(${v}) is not equal to Invalid(${es})`);
        },
        es => es.toArray(),
      ),
    ).toEqual(es);
  }

  describe('factory functions', () => {
    describe('valid', () => {
      it('creates valid value', () => {
        assertIsValid(valid(1), 1);
      });
    });

    describe('invalid', () => {
      it('creates invalid value', () => {
        assertIsInvalid(invalid(NonEmptyList.of(1, [2])), [1, 2]);
      });
    });

    describe('invalidUnit', () => {
      it('creates invalid value from single value', () => {
        assertIsInvalid(invalidUnit(1), [1]);
      });
    });
  });

  describe('utility functions', () => {
    describe('validateAll', () => {
      it('returns valid object if every value is valid', () => {
        const actual = validateAll({
          a: valid(1),
          b: valid('string'),
          c: valid(true),
        });
        assertIsValid(actual, { a: 1, b: 'string', c: true });
      });

      it('returns invalid if some of them are invalid', () => {
        const actual = validateAll({
          a: invalidUnit('Fail A'),
          b: valid('string'),
          c: invalidUnit('Fail B'),
        });
        assertIsInvalid(actual, ['Fail A', 'Fail B']);
      });
    });

    describe('mapN', () => {
      it('returns f applied validated for valid objects', () => {
        const actual = mapN(valid(1), valid('string'), valid(true))((a, b, c) => `${a}-${b}-${c}`);
        assertIsValid(actual, '1-string-true');
      });

      it('returns invalid value for objects including invalid', () => {
        const actual = mapN(
          invalidUnit('Fail 1'),
          valid('string'),
          invalidUnit('Fail 2'),
        )((a, b, c) => `${a}-${b}-${c}`);
        assertIsInvalid(actual, ['Fail 1', 'Fail 2']);
      });
    });
  });

  describe('valid value', () => {
    const sampleValue = valid<number, number>(1);

    describe('valid', () => {
      it('can be used for type narrowing', () => {
        if (sampleValue.valid) {
          expect(sampleValue.value).toBe(1);
        } else {
          throw new Error(`${sampleValue} should be valid`);
        }
      });
    });

    describe('fold', () => {
      it('applies onSuccess', () => {
        const actual = sampleValue.fold(
          n => n * 2,
          () => {
            throw new Error(`onFailure should not be applied`);
          },
        );
        expect(actual).toBe(2);
      });
    });

    describe('map', () => {
      it('applies f', () => {
        const actual = sampleValue.map(n => n * 2);
        assertIsValid(actual, 2);
      });
    });

    describe('map2', () => {
      it('applies f if the other one is valid', () => {
        const actual = sampleValue.map2(valid(2))((a, b) => a + b);
        assertIsValid(actual, 3);
      });

      it('returns invalid if the other one is invalid', () => {
        const actual = sampleValue.map2(invalidUnit(1))((a, b) => a + b);
        assertIsInvalid(actual, [1]);
      });
    });

    describe('andThen', () => {
      it('applies f and flatten if the other one is valid', () => {
        const actual = sampleValue.andThen(n => valid(n * 2));
        assertIsValid(actual, 2);
      });

      it('returns invalid if the other one is invalid', () => {
        const actual = sampleValue.andThen(n => invalidUnit(n));
        assertIsInvalid(actual, [1]);
      });
    });

    describe('orElse', () => {
      it('return self without any modification', () => {
        const actual = sampleValue.orElse(() => invalidUnit(1));
        assertIsValid(actual, 1);
      });
    });
  });

  describe('invalid value', () => {
    const sampleValue = invalidUnit<number, number>(1);

    describe('valid', () => {
      it('can be used for type narrowing', () => {
        if (sampleValue.valid) {
          throw new Error(`${sampleValue} should be invalid`);
        } else {
          expect(sampleValue.errors.toArray()).toEqual([1]);
        }
      });
    });

    describe('fold', () => {
      it('applies onFailure', () => {
        const actual = sampleValue.fold<number[]>(
          () => {
            throw new Error(`onFailure should not be applied`);
          },
          es => es.toArray(),
        );
        expect(actual).toEqual([1]);
      });
    });

    describe('map', () => {
      it('returns self without any modification', () => {
        const actual = sampleValue.map(n => n * 2);
        assertIsInvalid(actual, [1]);
      });
    });

    describe('map2', () => {
      it('returns self if the other one is valid', () => {
        const actual = sampleValue.map2(valid(2))((a, b) => a + b);
        assertIsInvalid(actual, [1]);
      });

      it('returns merged invalid if the other one is also invalid', () => {
        const actual = sampleValue.map2(invalidUnit(2))((a, b) => a + b);
        assertIsInvalid(actual, [1, 2]);
      });
    });

    describe('andThen', () => {
      it('returns self without any modification', () => {
        const actual = sampleValue.andThen(n => valid(n * 2));
        assertIsInvalid(actual, [1]);
      });
    });

    describe('orElse', () => {
      it('return alternative valid', () => {
        const actual = sampleValue.orElse(() => valid(1));
        assertIsValid(actual, 1);
      });

      it('return alternative invalid', () => {
        const actual = sampleValue.orElse(() => invalidUnit(2));
        assertIsInvalid(actual, [2]);
      });
    });
  });
});
