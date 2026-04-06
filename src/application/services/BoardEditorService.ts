import { BoardNode } from '@domain/entities/BoardNode';
import { CommunicationBoard } from '@domain/entities/CommunicationBoard';
import type { IBoardRepository } from '@domain/repositories/IBoardRepository';
import { DefaultBoardFactory } from '@domain/services/DefaultBoardFactory';

export class BoardEditorService {
  constructor(private readonly repository: IBoardRepository) {}

  loadActiveBoard(): CommunicationBoard {
    const activeId = this.repository.getActiveBoardId();
    if (activeId) {
      const board = this.repository.load(activeId);
      if (board) return board;
    }

    const defaultBoard = DefaultBoardFactory.create();
    this.repository.save(defaultBoard);
    this.repository.setActiveBoardId(defaultBoard.id);
    return defaultBoard;
  }

  loadAllBoards(): CommunicationBoard[] {
    return this.repository.loadAll();
  }

  setActiveBoard(boardId: string): void {
    if (!this.repository.exists(boardId)) {
      throw new Error(`Board not found: ${boardId}`);
    }
    this.repository.setActiveBoardId(boardId);
  }

  createBoard(name: string): CommunicationBoard {
    const id = generateId();
    const board = CommunicationBoard.create(id, name);
    this.repository.save(board);
    return board;
  }

  renameBoard(boardId: string, name: string): CommunicationBoard {
    const board = this.loadBoard(boardId);
    const updated = board.withName(name);
    this.repository.save(updated);
    return updated;
  }

  deleteBoard(boardId: string): void {
    const activeId = this.repository.getActiveBoardId();
    if (activeId === boardId) {
      throw new Error('Cannot delete the active board');
    }
    this.repository.delete(boardId);
  }

  addNode(boardId: string, parentNodeId: string | null, label: string): CommunicationBoard {
    const board = this.loadBoard(boardId);
    const nodeId = generateId();

    if (parentNodeId === null) {
      const order = board.rootNodeCount();
      const newNode = BoardNode.create(nodeId, label, order);
      const updated = board.addRootNode(newNode);
      this.repository.save(updated);
      return updated;
    }

    const updated = this.addNodeToParent(board, parentNodeId, nodeId, label);
    this.repository.save(updated);
    return updated;
  }

  removeNode(boardId: string, nodeId: string): CommunicationBoard {
    const board = this.loadBoard(boardId);
    const updated = this.removeNodeFromBoard(board, nodeId);
    this.repository.save(updated);
    return updated;
  }

  updateNodeLabel(boardId: string, nodeId: string, label: string): CommunicationBoard {
    const board = this.loadBoard(boardId);
    const updated = this.updateNodeInBoard(board, nodeId, (node) => node.withLabel(label));
    this.repository.save(updated);
    return updated;
  }

  moveNode(
    boardId: string,
    nodeId: string,
    targetParentId: string | null,
    targetIndex: number,
  ): CommunicationBoard {
    const board = this.loadBoard(boardId);
    const node = board.findNodeById(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);

    // Prevent dropping a node into itself or its own descendants
    if (targetParentId && this.isDescendantOf(node, targetParentId)) {
      return board;
    }

    // 1. Remove node from its current location
    const boardWithoutNode = this.removeNodeFromBoard(board, nodeId);

    // 2. Insert node at the target location
    const updated = this.insertNodeAt(boardWithoutNode, node, targetParentId, targetIndex);
    this.repository.save(updated);
    return updated;
  }

  private isDescendantOf(node: BoardNode, targetId: string): boolean {
    if (node.id === targetId) return true;
    for (const child of node.children) {
      if (this.isDescendantOf(child, targetId)) return true;
    }
    return false;
  }

  private insertNodeAt(
    board: CommunicationBoard,
    node: BoardNode,
    parentId: string | null,
    index: number,
  ): CommunicationBoard {
    if (parentId === null) {
      const roots = [...board.rootNodes];
      const clampedIndex = Math.min(index, roots.length);
      roots.splice(clampedIndex, 0, node);
      const reordered = roots.map((n, i) => n.withOrder(i));
      return board.withRootNodes(reordered);
    }

    const updatedRoots = this.insertNodeInNodes([...board.rootNodes], node, parentId, index);
    return board.withRootNodes(updatedRoots);
  }

  private insertNodeInNodes(
    nodes: BoardNode[],
    nodeToInsert: BoardNode,
    parentId: string,
    index: number,
  ): BoardNode[] {
    return nodes.map((n) => {
      if (n.id === parentId) {
        const children = [...n.children];
        const clampedIndex = Math.min(index, children.length);
        children.splice(clampedIndex, 0, nodeToInsert);
        const reordered = children.map((c, i) => c.withOrder(i));
        return n.withChildren(reordered);
      }
      if (n.isCategory()) {
        const updatedChildren = this.insertNodeInNodes([...n.children], nodeToInsert, parentId, index);
        return n.withChildren(updatedChildren);
      }
      return n;
    });
  }

  moveNodeUp(boardId: string, nodeId: string): CommunicationBoard {
    const board = this.loadBoard(boardId);
    const updated = this.reorderNode(board, nodeId, -1);
    this.repository.save(updated);
    return updated;
  }

  moveNodeDown(boardId: string, nodeId: string): CommunicationBoard {
    const board = this.loadBoard(boardId);
    const updated = this.reorderNode(board, nodeId, 1);
    this.repository.save(updated);
    return updated;
  }

  private loadBoard(boardId: string): CommunicationBoard {
    const board = this.repository.load(boardId);
    if (!board) throw new Error(`Board not found: ${boardId}`);
    return board;
  }

  private addNodeToParent(
    board: CommunicationBoard,
    parentNodeId: string,
    newNodeId: string,
    label: string,
  ): CommunicationBoard {
    const updatedRoots = this.addNodeToNodes([...board.rootNodes], parentNodeId, newNodeId, label);
    return board.withRootNodes(updatedRoots);
  }

  private addNodeToNodes(
    nodes: BoardNode[],
    parentId: string,
    newNodeId: string,
    label: string,
  ): BoardNode[] {
    return nodes.map((node) => {
      if (node.id === parentId) {
        const order = node.childCount();
        const child = BoardNode.create(newNodeId, label, order);
        return node.addChild(child);
      }
      if (node.isCategory()) {
        const updatedChildren = this.addNodeToNodes([...node.children], parentId, newNodeId, label);
        return node.withChildren(updatedChildren);
      }
      return node;
    });
  }

  private removeNodeFromBoard(board: CommunicationBoard, nodeId: string): CommunicationBoard {
    const rootIsTarget = board.rootNodes.some((n) => n.id === nodeId);
    if (rootIsTarget) {
      return board.removeRootNode(nodeId);
    }
    const updatedRoots = this.removeNodeFromNodes([...board.rootNodes], nodeId);
    return board.withRootNodes(updatedRoots);
  }

  private removeNodeFromNodes(nodes: BoardNode[], nodeId: string): BoardNode[] {
    return nodes
      .filter((n) => n.id !== nodeId)
      .map((node) => {
        if (node.isCategory()) {
          const updatedChildren = this.removeNodeFromNodes([...node.children], nodeId);
          return node.withChildren(updatedChildren);
        }
        return node;
      });
  }

  private updateNodeInBoard(
    board: CommunicationBoard,
    nodeId: string,
    updater: (node: BoardNode) => BoardNode,
  ): CommunicationBoard {
    const updatedRoots = this.updateNodeInNodes([...board.rootNodes], nodeId, updater);
    return board.withRootNodes(updatedRoots);
  }

  private updateNodeInNodes(
    nodes: BoardNode[],
    nodeId: string,
    updater: (node: BoardNode) => BoardNode,
  ): BoardNode[] {
    return nodes.map((node) => {
      if (node.id === nodeId) return updater(node);
      if (node.isCategory()) {
        const updatedChildren = this.updateNodeInNodes([...node.children], nodeId, updater);
        return node.withChildren(updatedChildren);
      }
      return node;
    });
  }

  private reorderNode(board: CommunicationBoard, nodeId: string, direction: -1 | 1): CommunicationBoard {
    const rootIndex = board.rootNodes.findIndex((n) => n.id === nodeId);
    if (rootIndex !== -1) {
      const roots = [...board.rootNodes];
      const targetIndex = rootIndex + direction;
      if (targetIndex < 0 || targetIndex >= roots.length) return board;
      [roots[rootIndex], roots[targetIndex]] = [roots[targetIndex]!, roots[rootIndex]!];
      const reordered = roots.map((n, i) => n.withOrder(i));
      return board.withRootNodes(reordered);
    }

    const updatedRoots = this.reorderNodeInNodes([...board.rootNodes], nodeId, direction);
    return board.withRootNodes(updatedRoots);
  }

  private reorderNodeInNodes(nodes: BoardNode[], nodeId: string, direction: -1 | 1): BoardNode[] {
    const index = nodes.findIndex((n) => n.id === nodeId);
    if (index !== -1) {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= nodes.length) return nodes;
      const result = [...nodes];
      [result[index], result[targetIndex]] = [result[targetIndex]!, result[index]!];
      return result.map((n, i) => n.withOrder(i));
    }

    return nodes.map((node) => {
      if (node.isCategory()) {
        const updatedChildren = this.reorderNodeInNodes([...node.children], nodeId, direction);
        return node.withChildren(updatedChildren);
      }
      return node;
    });
  }
}

function generateId(): string {
  return crypto.randomUUID();
}
