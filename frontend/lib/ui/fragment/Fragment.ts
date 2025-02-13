import './patches';

class Fragment extends Comment {
  constructor(readonly nodes: Node[]) {
    super();
    for (const node of this.nodes) (node as any).fragmentParent = this;
  }

  insertNodes() {
    if (this.parentNode == null) return;

    for (let i = this.nodes.length - 1; i >= 0; i--) {
      this.parentNode.insertBefore(this.nodes[i], super.nextSibling);
      if (this.nodes[i] instanceof Fragment) (this.nodes[i] as Fragment).insertNodes();
    }
  }

  get nextSibling() {
    if (this.nodes.length > 0) return this.nodes[this.nodes.length - 1].nextSibling;
    return super.nextSibling;
  }

  insertChildAtIndex(child: Node, index: number) {
    this.removeChild(child);

    if (this.parentNode)
      this.parentNode.insertBefore(
        child,
        this.nodes[index + 1] ?? (this.nodes[this.nodes.length - 1] ?? this)?.nextSibling
      );

    this.nodes.splice(index, 0, child);
    (child as any).fragmentParent = this;

    if (child instanceof Fragment) (child as Fragment).insertNodes();
  }

  removeNodes() {
    if (this.parentNode == null) return;
    for (const node of this.nodes) {
      if (node instanceof Fragment) node.removeNodes();
      this.parentNode.removeChild(node);
    }
  }

  override remove() {
    this.removeNodes();
    super.remove();
  }

  override replaceWith(...nodes: (string | Node)[]): void {
    this.removeNodes();
    super.replaceWith(...nodes);
  }

  override appendChild<T extends Node>(node: T): T {
    this.removeChild(node);
    (node as any).fragmentParent = this;
    if (this.parentNode != null)
      this.parentNode.insertBefore(node, (this.nodes[this.nodes.length - 1] ?? this).nextSibling);
    this.nodes.push(node);
    if (node instanceof Fragment) node.insertNodes();
    return node;
  }

  override removeChild<T extends Node>(child: T): T {
    const index = this.nodes.indexOf(child);
    if (index === -1) return child;

    this.nodes.splice(index, 1);
    (child as any).fragmentParent = null;

    if (this.parentNode != null) this.parentNode.removeChild(child);
    return child;
  }

  removeChildAtIndex(index: number) {
    if (this.parentNode != null) this.parentNode.removeChild(this.nodes[index]);
    (this.nodes[index] as any).fragmentParent = null;
    this.nodes.splice(index, 1);
  }

  _replaceChildInNodeArray(child: Node, ...nodes: Node[]) {
    for (const node of nodes) (node as any).fragmentParent = this;
    const index = this.nodes.findIndex(n => n === child);
    this.nodes.splice(index, 1, ...nodes);
    (child as any).fragmentParent = null;
  }
}

export { Fragment };
