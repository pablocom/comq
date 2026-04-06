import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BoardNode } from '@domain/entities/BoardNode';
import { CommunicationBoard } from '@domain/entities/CommunicationBoard';
import type { IBoardRepository } from '@domain/repositories/IBoardRepository';
import { BoardSharingService } from '@application/services/BoardSharingService';

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

describe('BoardSharingService', () => {
  let service: BoardSharingService;
  let repository: IBoardRepository;

  const createTestBoard = (id = 'board-1', name = 'Tablero de prueba') =>
    CommunicationBoard.create(id, name, [
      BoardNode.create('cat1', 'Categoría', 0, [
        BoardNode.create('msg1', 'Mensaje', 0),
      ]),
    ]);

  beforeEach(() => {
    repository = createMockRepository();
    service = new BoardSharingService(repository);
  });

  describe('exportAll', () => {
    it('exports all boards as a JSON string with comqVersion and activeBoardId', () => {
      const board1 = createTestBoard('b1', 'Primero');
      const board2 = createTestBoard('b2', 'Segundo');
      repository.save(board1);
      repository.save(board2);
      repository.setActiveBoardId('b1');

      const json = service.exportAll();
      const parsed = JSON.parse(json);

      expect(parsed.comqVersion).toBe(1);
      expect(parsed.activeBoardId).toBe('b1');
      expect(parsed.boards).toHaveLength(2);
      expect(parsed.boards.map((b: { name: string }) => b.name).sort()).toEqual([
        'Primero',
        'Segundo',
      ]);
    });

    it('exports an empty boards array when no boards exist', () => {
      const json = service.exportAll();
      const parsed = JSON.parse(json);

      expect(parsed.boards).toEqual([]);
    });
  });

  describe('parseAndValidate', () => {
    it('successfully parses a valid export with multiple boards', () => {
      const board1 = createTestBoard('b1', 'Primero');
      const board2 = createTestBoard('b2', 'Segundo');
      repository.save(board1);
      repository.save(board2);
      repository.setActiveBoardId('b1');

      const json = service.exportAll();
      const result = service.parseAndValidate(json);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.boards).toHaveLength(2);
        expect(result.value.activeBoardId).toBe('b1');
      }
    });

    it('rejects invalid JSON syntax', () => {
      const result = service.parseAndValidate('{invalid json}');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]?.message).toContain('JSON no es válido');
      }
    });

    it('rejects JSON that is not an object', () => {
      const result = service.parseAndValidate('"just a string"');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]?.message).toContain('objeto JSON');
      }
    });

    it('rejects when boards field is missing', () => {
      const result = service.parseAndValidate(JSON.stringify({ foo: 'bar' }));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]?.message).toContain('boards');
      }
    });

    it('rejects when boards array is empty', () => {
      const result = service.parseAndValidate(
        JSON.stringify({ comqVersion: 1, boards: [], activeBoardId: null }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]?.message).toContain('no contiene tableros');
      }
    });

    it('rejects a board with empty name', () => {
      const json = JSON.stringify({
        comqVersion: 1,
        activeBoardId: null,
        boards: [{ ...createTestBoard().toProps(), name: '  ' }],
      });
      const result = service.parseAndValidate(json);

      expect(result.success).toBe(false);
    });

    it('rejects a board with duplicate node IDs', () => {
      const json = JSON.stringify({
        comqVersion: 1,
        activeBoardId: null,
        boards: [
          {
            id: 'b1',
            name: 'Duplicados',
            rootNodes: [
              { id: 'same', label: 'A', children: [], order: 0 },
              { id: 'same', label: 'B', children: [], order: 1 },
            ],
            locale: 'es-ES',
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      });

      const result = service.parseAndValidate(json);

      expect(result.success).toBe(false);
    });
  });

  describe('importAll', () => {
    it('saves all imported boards to the repository', () => {
      const boards = [createTestBoard('b1', 'Primero'), createTestBoard('b2', 'Segundo')];
      service.importAll({ boards, activeBoardId: 'b1' });

      expect(repository.save).toHaveBeenCalledTimes(2);
      expect(repository.setActiveBoardId).toHaveBeenCalledWith('b1');
    });

    it('does not set active board when activeBoardId is null', () => {
      const boards = [createTestBoard()];
      service.importAll({ boards, activeBoardId: null });

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.setActiveBoardId).not.toHaveBeenCalled();
    });
  });

  describe('round-trip: exportAll then importAll', () => {
    it('preserves all boards through export and import', () => {
      const board1 = createTestBoard('b1', 'Primero');
      const board2 = createTestBoard('b2', 'Segundo');
      repository.save(board1);
      repository.save(board2);
      repository.setActiveBoardId('b1');

      const json = service.exportAll();
      const parseResult = service.parseAndValidate(json);

      expect(parseResult.success).toBe(true);
      if (parseResult.success) {
        expect(parseResult.value.boards).toHaveLength(2);
        expect(parseResult.value.activeBoardId).toBe('b1');

        const names = parseResult.value.boards.map((b) => b.name).sort();
        expect(names).toEqual(['Primero', 'Segundo']);
      }
    });
  });
});
