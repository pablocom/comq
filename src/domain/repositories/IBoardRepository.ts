import { CommunicationBoard } from '../entities/CommunicationBoard';

export interface IBoardRepository {
  save(board: CommunicationBoard): void;
  load(boardId: string): CommunicationBoard | null;
  loadAll(): CommunicationBoard[];
  delete(boardId: string): void;
  exists(boardId: string): boolean;
  getActiveBoardId(): string | null;
  setActiveBoardId(boardId: string): void;
}
