type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

type IntersectValuesOf<T> = UnionToIntersection<T[keyof T]>;

type KeysOfType<TObject, T> = {
  [TK in keyof TObject]: TObject[TK] extends T ? TK : never;
}[keyof TObject];

type KeysNotOfType<TObject, T> = {
  [TK in keyof TObject]: TObject[TK] extends T ? never : TK;
}[keyof TObject];

type FlattenTranslations<T, TPath extends string = ''> = {
  [K in KeysNotOfType<T, object> | KeysOfType<T, any[]> as `${TPath}${K extends string ? K : ''}`]: T[K];
} & IntersectValuesOf<{
  [K in Exclude<KeysOfType<T, object>, KeysOfType<T, any[]>> as `${TPath}${K extends string
    ? K
    : ''}`]: FlattenTranslations<T[K], `${TPath}${K extends string ? K : ''}.`>;
}>;

function flattenTranslations<T>(object: T, path: string = '', flatObject: any = {}): FlattenTranslations<T> {
  for (const key in object) {
    const value = object[key];

    if (value == null || typeof value !== 'object') {
      flatObject[path + key] = value;
      continue;
    }

    flattenTranslations(value, `${path}${key}.`, flatObject);
  }

  return flatObject;
}

export { FlattenTranslations, flattenTranslations };
