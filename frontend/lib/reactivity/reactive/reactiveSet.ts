function makeSetReactive<T extends Set<any>>(set: T, depth: number): T {
  console.log('set');

  return set;
}

export { makeSetReactive };
