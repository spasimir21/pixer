function makeMapReactive<T extends Map<any, any>>(map: T, depth: number): T {
  console.log('map');

  return map;
}

export { makeMapReactive };
