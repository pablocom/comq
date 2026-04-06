export interface BoardNodeProps {
  id: string;
  label: string;
  children: BoardNode[];
  order: number;
}

export class BoardNode {
  readonly id: string;
  readonly label: string;
  readonly children: ReadonlyArray<BoardNode>;
  readonly order: number;

  constructor(props: BoardNodeProps) {
    this.id = props.id;
    this.label = props.label;
    this.children = [...props.children];
    this.order = props.order;
  }

  isCategory(): boolean {
    return this.children.length > 0;
  }

  isMessage(): boolean {
    return this.children.length === 0;
  }

  displayIcon(): string {
    return this.isCategory() ? '\uD83D\uDCC2' : '\uD83D\uDCAC';
  }

  childAt(index: number): BoardNode | undefined {
    return this.children[index];
  }

  childCount(): number {
    return this.children.length;
  }

  withLabel(label: string): BoardNode {
    return new BoardNode({ ...this.toProps(), label });
  }

  withChildren(children: BoardNode[]): BoardNode {
    return new BoardNode({ ...this.toProps(), children });
  }

  withOrder(order: number): BoardNode {
    return new BoardNode({ ...this.toProps(), order });
  }

  addChild(child: BoardNode): BoardNode {
    const children = [...this.children, child];
    return this.withChildren(children);
  }

  removeChild(childId: string): BoardNode {
    const children = this.children.filter((c) => c.id !== childId);
    return this.withChildren(children);
  }

  toProps(): BoardNodeProps {
    return {
      id: this.id,
      label: this.label,
      children: [...this.children],
      order: this.order,
    };
  }

  static create(id: string, label: string, order: number, children: BoardNode[] = []): BoardNode {
    return new BoardNode({ id, label, children, order });
  }
}
