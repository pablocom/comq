import { BoardNode } from './BoardNode';

export interface CommunicationBoardProps {
  id: string;
  name: string;
  rootNodes: BoardNode[];
  locale: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export class CommunicationBoard {
  readonly id: string;
  readonly name: string;
  readonly rootNodes: ReadonlyArray<BoardNode>;
  readonly locale: string;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(props: CommunicationBoardProps) {
    this.id = props.id;
    this.name = props.name;
    this.rootNodes = [...props.rootNodes];
    this.locale = props.locale;
    this.version = props.version;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isEmpty(): boolean {
    return this.rootNodes.length === 0;
  }

  rootNodeAt(index: number): BoardNode | undefined {
    return this.rootNodes[index];
  }

  rootNodeCount(): number {
    return this.rootNodes.length;
  }

  withName(name: string): CommunicationBoard {
    return new CommunicationBoard({ ...this.toProps(), name, updatedAt: now() });
  }

  withRootNodes(rootNodes: BoardNode[]): CommunicationBoard {
    return new CommunicationBoard({ ...this.toProps(), rootNodes, updatedAt: now() });
  }

  addRootNode(node: BoardNode): CommunicationBoard {
    return this.withRootNodes([...this.rootNodes, node]);
  }

  removeRootNode(nodeId: string): CommunicationBoard {
    return this.withRootNodes(this.rootNodes.filter((n) => n.id !== nodeId));
  }

  findNodeById(nodeId: string): BoardNode | undefined {
    return findInNodes([...this.rootNodes], nodeId);
  }

  toProps(): CommunicationBoardProps {
    return {
      id: this.id,
      name: this.name,
      rootNodes: [...this.rootNodes],
      locale: this.locale,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static create(id: string, name: string, rootNodes: BoardNode[] = []): CommunicationBoard {
    const timestamp = now();
    return new CommunicationBoard({
      id,
      name,
      rootNodes,
      locale: 'es-ES',
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }
}

function findInNodes(nodes: BoardNode[], targetId: string): BoardNode | undefined {
  for (const node of nodes) {
    if (node.id === targetId) return node;
    if (node.isCategory()) {
      const found = findInNodes([...node.children], targetId);
      if (found) return found;
    }
  }
  return undefined;
}

function now(): string {
  return new Date().toISOString();
}
