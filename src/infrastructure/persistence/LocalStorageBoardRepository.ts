import { BoardNode, type BoardNodeProps } from '@domain/entities/BoardNode';
import { CommunicationBoard, type CommunicationBoardProps } from '@domain/entities/CommunicationBoard';
import type { IBoardRepository } from '@domain/repositories/IBoardRepository';

const BOARDS_KEY = 'comq:boards:v1';
const ACTIVE_BOARD_KEY = 'comq:active-board';

interface SerializedBoards {
  [boardId: string]: CommunicationBoardProps;
}

export class LocalStorageBoardRepository implements IBoardRepository {
  save(board: CommunicationBoard): void {
    const boards = this.readAllRaw();
    boards[board.id] = board.toProps();
    this.writeAll(boards);
  }

  load(boardId: string): CommunicationBoard | null {
    const boards = this.readAllRaw();
    const raw = boards[boardId];
    if (!raw) return null;
    return this.deserializeBoard(raw);
  }

  loadAll(): CommunicationBoard[] {
    const boards = this.readAllRaw();
    return Object.values(boards).map((raw) => this.deserializeBoard(raw));
  }

  delete(boardId: string): void {
    const boards = this.readAllRaw();
    delete boards[boardId];
    this.writeAll(boards);
  }

  exists(boardId: string): boolean {
    const boards = this.readAllRaw();
    return boardId in boards;
  }

  getActiveBoardId(): string | null {
    return localStorage.getItem(ACTIVE_BOARD_KEY);
  }

  setActiveBoardId(boardId: string): void {
    localStorage.setItem(ACTIVE_BOARD_KEY, boardId);
  }

  private readAllRaw(): SerializedBoards {
    const raw = localStorage.getItem(BOARDS_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as SerializedBoards;
    } catch {
      return {};
    }
  }

  private writeAll(boards: SerializedBoards): void {
    localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
  }

  private deserializeBoard(raw: CommunicationBoardProps): CommunicationBoard {
    const rootNodes = (raw.rootNodes || []).map((n) =>
      this.deserializeNode(n as unknown as BoardNodeProps),
    );
    return new CommunicationBoard({
      id: raw.id,
      name: raw.name,
      rootNodes,
      locale: raw.locale || 'es-ES',
      version: raw.version || 1,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  private deserializeNode(raw: BoardNodeProps): BoardNode {
    const children = (raw.children || []).map((c) =>
      this.deserializeNode(c as unknown as BoardNodeProps),
    );
    return new BoardNode({
      id: raw.id,
      label: raw.label,
      children,
      order: raw.order ?? 0,
    });
  }
}
