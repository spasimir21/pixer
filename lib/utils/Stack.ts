class Stack<T = any> {
  private readonly items: T[] = [];

  get size(): number {
    return this.items.length;
  }

  push(item: T) {
    this.items.push(item);
    return item;
  }

  peek(): T | null {
    return this.items[this.items.length - 1];
  }

  pop() {
    return this.items.pop() ?? null;
  }
}

export { Stack };
