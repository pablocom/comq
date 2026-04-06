import { BoardNode } from '../entities/BoardNode';
import { CommunicationBoard } from '../entities/CommunicationBoard';
import { ScanState } from '../value-objects/ScanState';

export interface ScanResult {
  state: ScanState;
  currentNode: BoardNode;
}

export interface SelectionResult {
  kind: 'entered-category' | 'selected-message';
  state: ScanState;
  currentNode: BoardNode;
}

export class ScanningDomainService {
  resolveCurrentNodes(board: CommunicationBoard, state: ScanState): ReadonlyArray<BoardNode> {
    if (state.isAtRoot()) {
      return board.rootNodes;
    }

    let nodes: ReadonlyArray<BoardNode> = board.rootNodes;
    for (const nodeId of state.currentPath) {
      const parent = nodes.find((n) => n.id === nodeId);
      if (!parent || parent.isMessage()) return [];
      nodes = parent.children;
    }
    return nodes;
  }

  resolveCurrentNode(board: CommunicationBoard, state: ScanState): BoardNode | undefined {
    const nodes = this.resolveCurrentNodes(board, state);
    return nodes[state.currentIndex];
  }

  scanNext(board: CommunicationBoard, state: ScanState): ScanResult {
    const nodes = this.resolveCurrentNodes(board, state);
    if (nodes.length === 0) {
      throw new Error('Cannot scan: no nodes at current level');
    }

    const nextIndex = (state.currentIndex + 1) % nodes.length;
    const nextState = state.withIndex(nextIndex);
    return {
      state: nextState,
      currentNode: nodes[nextIndex]!,
    };
  }

  select(board: CommunicationBoard, state: ScanState): SelectionResult {
    const currentNode = this.resolveCurrentNode(board, state);
    if (!currentNode) {
      throw new Error('Cannot select: no node at current position');
    }

    if (currentNode.isCategory()) {
      const newState = state.enterCategory(currentNode.id);
      const firstChild = currentNode.childAt(0);
      if (!firstChild) throw new Error('Category has no children');
      return {
        kind: 'entered-category',
        state: newState,
        currentNode: firstChild,
      };
    }

    return {
      kind: 'selected-message',
      state,
      currentNode,
    };
  }

  goBack(board: CommunicationBoard, state: ScanState): ScanResult {
    if (state.isAtRoot()) {
      const rootNode = this.resolveCurrentNode(board, state);
      if (!rootNode) throw new Error('Cannot go back: empty board');
      return { state, currentNode: rootNode };
    }

    const parentState = state.goBack();
    const parentNode = this.resolveCurrentNode(board, parentState);
    if (!parentNode) throw new Error('Cannot go back: parent not found');
    return { state: parentState, currentNode: parentNode };
  }

  buildPathLabels(board: CommunicationBoard, state: ScanState): string[] {
    const labels: string[] = [];
    let nodes: ReadonlyArray<BoardNode> = board.rootNodes;

    for (const nodeId of state.currentPath) {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) break;
      labels.push(node.label);
      nodes = node.children;
    }

    return labels;
  }
}
