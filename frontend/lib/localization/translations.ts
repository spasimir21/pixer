type GetTranslationsType<T> = {
  [K in keyof T]: T[K] extends string ? string : GetTranslationsType<T[K]>;
};

export { GetTranslationsType };
