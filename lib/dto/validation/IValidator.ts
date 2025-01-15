interface IValidator<T> {
  isValid(value: any): value is T;
}

export { IValidator };
