/**
 * A list with at least one element.
 */
export class NonEmptyList<A> {
  private constructor(public readonly head: A, public readonly tail: A[] = []) {}

  toArray(): A[] {
    return [this.head, ...this.tail];
  }

  /**
   * Corresponds with Array.map
   * @param f
   */
  map<B>(f: (a: A) => B): NonEmptyList<B> {
    return NonEmptyList.of(f(this.head), this.tail.map(f));
  }

  /**
   * Corresponds with Array.flatMap
   * @param f
   */
  flatMap<B>(f: (a: A) => NonEmptyList<B>): NonEmptyList<B> {
    return f(this.head).concatWithArray(this.tail.flatMap(a => f(a).toArray()));
  }

  /**
   * Pure version of concatenation with another NonEmptyList.
   * @param that
   */
  concat(that: NonEmptyList<A>): NonEmptyList<A> {
    return this.concatWithArray(that.toArray());
  }

  /**
   * Pure version of concatenation with an Array.
   * @param that
   */
  concatWithArray(that: A[]): NonEmptyList<A> {
    return NonEmptyList.of(this.head, [...this.tail, ...that]);
  }

  /**
   * Corresponds with Array.filter
   * @param f
   */
  filter(f: (a: A) => boolean): A[] {
    return this.toArray().filter(f);
  }

  /**
   * Corresponds with Array.reduce with initial value
   * @param f
   * @param z
   */
  fold<B>(f: (acc: B, a: A) => B, z: B): B {
    return this.toArray().reduce(f, z);
  }

  /**
   * Corresponds with Array.reduce without initial value
   * @param f
   */
  reduce(f: (acc: A, a: A) => A): A {
    return this.toArray().reduce(f);
  }

  /**
   * Corresponds with Array.every
   * @param predicate
   */
  every(predicate: (a: A) => boolean): boolean {
    return this.toArray().every(predicate);
  }

  /**
   * Corresponds with Array.some
   * @param predicate
   */
  some(predicate: (a: A) => boolean): boolean {
    return this.toArray().some(predicate);
  }

  /**
   * Corresponds with Array.find
   * @param predicate
   */
  find(predicate: (a: A) => boolean): A | undefined {
    return this.toArray().find(predicate);
  }

  /**
   * Corresponds with Array.findIndex
   * @param predicate
   */
  findIndex(predicate: (a: A) => boolean): number {
    return this.toArray().findIndex(predicate);
  }

  /**
   * Corresponds with Array.includes
   * @param a
   */
  includes(a: A): boolean {
    return this.toArray().includes(a);
  }

  /**
   * Corresponds with Array.join
   * @param separator
   */
  join(separator?: string): string {
    return this.toArray().join(separator);
  }

  /**
   * Corresponds with Array.forEach
   * @param f
   */
  forEach(f: (a: A) => void): void {
    this.toArray().forEach(f);
  }

  /**
   * Build new NonEmptyList
   * @param head
   * @param tail
   */
  static of<A>(head: A, tail: A[] = []): NonEmptyList<A> {
    return new NonEmptyList(head, tail);
  }
}
