export function identity<A>(value: A): A {
  return value;
}

export function compose<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C {
  return a => g(f(a));
}
