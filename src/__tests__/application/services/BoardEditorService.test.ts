import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BoardNode } from '@domain/entities/BoardNode';
import { CommunicationBoard } from '@domain/entities/CommunicationBoard';
import type { IBoardRepository } from '@domain/repositories/IBoardRepository';
import { BoardEditorService } from '@application/services/BoardEditorService';

function createMockRepository(): IBoardRepository {
  const boards = new Map<string, CommunicationBoard>();
  let activeBoardId: string | null = null;

  return {
    save: vi.fn((board: CommunicationBoard) => {
      boards.set(board.id, board);
    }),
    load: vi.fn((id: string) => boards.get(id) ?? null),
    loadAll: vi.fn(() => Array.from(boards.values())),
    delete: vi.fn((id: string) => {
      boards.delete(id);
    }),
    exists: vi.fn((id: string) => boards.has(id)),
    getActiveBoardId: vi.fn(() => activeBoardId),
    setActiveBoardId: vi.fn((id: string) => {
      activeBoardId = id;
    }),
  };
}

describe('BoardEditorService', () => {
  let service: BoardEditorService;
  let repository: IBoardRepository;

  beforeEach(() => {
    repository = createMockRepository();
    service = new BoardEditorService(repository);
  });

  describe('loadActiveBoard', () => {
    it('creates a default board when no active board exists', () => {
      const board = service.loadActiveBoard();

      expect(board.name).toBe('Tablero predeterminado');
      expect(repository.save).toHaveBeenCalled();
      expect(repository.setActiveBoardId).toHaveBeenCalledWith(board.id);
    });

    it('loads the active board when one is set', () => {
      const existing = CommunicationBoard.create('existing', 'Mi tablero', [
        BoardNode.create('n1', 'Nodo', 0),
      ]);
      repository.save(existing);
      repository.setActiveBoardId('existing');

      const board = service.loadActiveBoard();
      expect(board.name).toBe('Mi tablero');
    });
  });

  describe('createBoard', () => {
    it('creates a new empty board with the given name', () => {
      const board = service.createBoard('Tablero nuevo');

      expect(board.name).toBe('Tablero nuevo');
      expect(board.isEmpty()).toBe(true);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('renameBoard', () => {
    it('updates the board name', () => {
      const board = service.createBoard('Original');
      const updated = service.renameBoard(board.id, 'Renombrado');

      expect(updated.name).toBe('Renombrado');
    });
  });

  describe('deleteBoard', () => {
    it('deletes a non-active board', () => {
      const board = service.createBoard('Para borrar');
      service.deleteBoard(board.id);

      expect(repository.delete).toHaveBeenCalledWith(board.id);
    });

    it('throws when trying to delete the active board', () => {
      const board = service.createBoard('Activo');
      repository.setActiveBoardId(board.id);

      expect(() => service.deleteBoard(board.id)).toThrow('Cannot delete the active board');
    });
  });

  describe('addNode', () => {
    it('adds a root node when parentNodeId is null', () => {
      const board = service.createBoard('Test');
      const updated = service.addNode(board.id, null, 'Nueva categoría');

      expect(updated.rootNodeCount()).toBe(1);
      expect(updated.rootNodeAt(0)?.label).toBe('Nueva categoría');
    });

    it('adds a child node to an existing node', () => {
      let board = service.createBoard('Test');
      board = service.addNode(board.id, null, 'Categoría');
      const categoryId = board.rootNodeAt(0)!.id;
      const updated = service.addNode(board.id, categoryId, 'Mensaje hijo');

      expect(updated.rootNodeAt(0)?.childCount()).toBe(1);
      expect(updated.rootNodeAt(0)?.childAt(0)?.label).toBe('Mensaje hijo');
    });
  });

  describe('removeNode', () => {
    it('removes a root node', () => {
      let board = service.createBoard('Test');
      board = service.addNode(board.id, null, 'Para borrar');
      const nodeId = board.rootNodeAt(0)!.id;
      const updated = service.removeNode(board.id, nodeId);

      expect(updated.isEmpty()).toBe(true);
    });
  });

  describe('updateNodeLabel', () => {
    it('updates the label of a node', () => {
      let board = service.createBoard('Test');
      board = service.addNode(board.id, null, 'Original');
      const nodeId = board.rootNodeAt(0)!.id;
      const updated = service.updateNodeLabel(board.id, nodeId, 'Actualizado');

      expect(updated.rootNodeAt(0)?.label).toBe('Actualizado');
    });
  });

  describe('moveNodeUp and moveNodeDown', () => {
    it('moves a node up in the order', () => {
      let board = service.createBoard('Test');
      board = service.addNode(board.id, null, 'Primero');
      board = service.addNode(board.id, null, 'Segundo');
      const secondId = board.rootNodeAt(1)!.id;
      const updated = service.moveNodeUp(board.id, secondId);

      expect(updated.rootNodeAt(0)?.label).toBe('Segundo');
      expect(updated.rootNodeAt(1)?.label).toBe('Primero');
    });

    it('moves a node down in the order', () => {
      let board = service.createBoard('Test');
      board = service.addNode(board.id, null, 'Primero');
      board = service.addNode(board.id, null, 'Segundo');
      const firstId = board.rootNodeAt(0)!.id;
      const updated = service.moveNodeDown(board.id, firstId);

      expect(updated.rootNodeAt(0)?.label).toBe('Segundo');
      expect(updated.rootNodeAt(1)?.label).toBe('Primero');
    });

    it('does nothing when moving the first node up', () => {
      let board = service.createBoard('Test');
      board = service.addNode(board.id, null, 'Primero');
      const firstId = board.rootNodeAt(0)!.id;
      const updated = service.moveNodeUp(board.id, firstId);

      expect(updated.rootNodeAt(0)?.label).toBe('Primero');
    });
  });
});
