import { compose, identity } from '@jooohn/util';

import { NonEmptyList } from './nel';

/**
 * Wrapper type of NonEmptyList<E> | A. Validated can be combined with another Validated object
 * collecting their errors.
 */
export type Validated<E, A> = Valid<E, A> | Invalid<E, A>;

export function valid<A, E = never>(value: A): Validated<E, A> {
  return new Valid(value);
}

export function invalid<E, A = never>(errors: NonEmptyList<E>): Validated<E, A> {
  return new Invalid(errors);
}

export function invalidUnit<E, A = never>(error: E): Validated<E, A> {
  return invalid(NonEmptyList.of(error));
}

export function map2<E, A, B, C>(
  vea: Validated<E, A>,
  veb: Validated<E, B>,
): (f: (a: A, b: B) => C) => Validated<E, C> {
  return f =>
    vea.fold(
      a => veb.fold(b => valid(f(a, b)), invalid),
      es1 =>
        veb.fold(
          () => invalid(es1),
          es2 => invalid(es1.concat(es2)),
        ),
    );
}

export function mapN<Err, A, B>(
  va: Validated<Err, A>,
  vb: Validated<Err, B>,
): <Result>(f: (a: A, b: B) => Result) => Validated<Err, Result>;
export function mapN<Err, A, B, C>(
  va: Validated<Err, A>,
  vb: Validated<Err, B>,
  vc: Validated<Err, C>,
): <Result>(f: (a: A, b: B, c: C) => Result) => Validated<Err, Result>;
export function mapN<Err, A, B, C, D>(
  va: Validated<Err, A>,
  vb: Validated<Err, B>,
  vc: Validated<Err, C>,
  vd: Validated<Err, D>,
): <Result>(f: (a: A, b: B, c: C, d: D) => Result) => Validated<Err, Result>;
export function mapN<Err, A, B, C, D, E>(
  va: Validated<Err, A>,
  vb: Validated<Err, B>,
  vc: Validated<Err, C>,
  vd: Validated<Err, D>,
  ve: Validated<Err, E>,
): <Result>(f: (a: A, b: B, c: C, d: D, e: E) => Result) => Validated<Err, Result>;
export function mapN<Err>(
  ...vs: Validated<Err, any>[]
): (f: (...args: any[]) => any) => Validated<Err, any> {
  return f =>
    vs
      .reduce((acc, v) => acc.map2(v)((values, value) => [...values, value]), valid([]))
      .map(values => f(...values));
}

type ValidatedObject<E> = {
  [key: string]: Validated<E, any>;
};

type ValidateAll<E, T extends ValidatedObject<E>> = Validated<
  E,
  {
    [P in keyof T]: T[P] extends Validated<E, infer V> ? V : never;
  }
>;

/**
 * Build a validated object from an object whose values are validated. This returns `Invalid`
 * if some of the original validated values are invalid.
 *
 * @param object
 */
export function validateAll<E, T extends ValidatedObject<E>>(object: T): ValidateAll<E, T> {
  const keys: (keyof T)[] = Object.keys(object);
  return keys.reduce(
    (current, key) =>
      current.map2(object[key])((acc, value) => ({
        ...acc,
        [key]: value,
      })),
    valid({}) as ValidateAll<E, T>,
  );
}

abstract class ValidatedBase<Valid extends boolean, E, A> {
  abstract get valid(): Valid;

  protected abstract asValidated(): Validated<E, A>;

  fold<B>(ifValid: (value: A) => B, ifInvalid: (errors: NonEmptyList<E>) => B): B {
    const validated = this.asValidated();
    return validated.valid ? ifValid(validated.value) : ifInvalid(validated.errors);
  }

  map<B>(f: (value: A) => B): Validated<E, B> {
    return this.bimap(f, identity);
  }

  map2<B>(that: Validated<E, B>): <C>(f: (a: A, b: B) => C) => Validated<E, C> {
    return map2(this.asValidated(), that);
  }

  bimap<B, E2>(
    ifValid: (a: A) => B,
    ifInvalid: (es: NonEmptyList<E>) => NonEmptyList<E2>,
  ): Validated<E2, B> {
    return this.fold<Validated<E2, B>>(compose(ifValid, valid), compose(ifInvalid, invalid));
  }

  andThen<B>(f: (value: A) => Validated<E, B>): Validated<E, B> {
    return this.fold(f, invalid);
  }

  orElse(alternative: () => Validated<E, A>): Validated<E, A> {
    return this.fold(valid, () => alternative());
  }

  leftMap<E2>(f: (es: NonEmptyList<E>) => NonEmptyList<E2>): Validated<E2, A> {
    return this.bimap(identity, f);
  }

  leftMapEach<E2>(f: (e: E) => E2): Validated<E2, A> {
    return this.leftMap(es => es.map(f));
  }
}

class Valid<E, A> extends ValidatedBase<true, E, A> {
  constructor(public readonly value: A) {
    super();
  }

  get valid(): true {
    return true;
  }

  protected asValidated(): Validated<E, A> {
    return this;
  }
}

class Invalid<E, A> extends ValidatedBase<false, E, A> {
  constructor(public readonly errors: NonEmptyList<E>) {
    super();
  }

  get valid(): false {
    return false;
  }

  protected asValidated(): Validated<E, A> {
    return this;
  }
}
