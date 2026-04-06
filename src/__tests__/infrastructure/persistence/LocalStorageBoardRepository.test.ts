import { describe, it, expect, beforeEach } from 'vitest';
import { BoardNode } from '@domain/entities/BoardNode';
import { CommunicationBoard } from '@domain/entities/CommunicationBoard';
import { LocalStorageBoardRepository } from '@infrastructure/persistence/LocalStorageBoardRepository';

describe('LocalStorageBoardRepository', () => {
  let repository: LocalStorageBoardRepository;

  beforeEach(() => {
    localStorage.clear();
    repository = new LocalStorageBoardRepository();
  });

  const createTestBoard = (id = 'b1', name = 'Test') =>
    CommunicationBoard.create(id, name, [
      BoardNode.create('cat1', 'Categoría', 0, [
        BoardNode.create('msg1', 'Mensaje', 0),
      ]),
    ]);

  describe('save and load', () => {
    it('persists a board and retrieves it', () => {
      const board = createTestBoard();
      repository.save(board);

      const loaded = repository.load('b1');

      expect(loaded).not.toBeNull();
      expect(loaded!.name).toBe('Test');
      expect(loaded!.rootNodeCount()).toBe(1);
      expect(loaded!.rootNodeAt(0)?.label).toBe('Categoría');
      expect(loaded!.rootNodeAt(0)?.childAt(0)?.label).toBe('Mensaje');
    });

    it('returns null for a non-existent board', () => {
      expect(repository.load('nonexistent')).toBeNull();
    });

    it('overwrites an existing board on save', () => {
      const original = createTestBoard();
      repository.save(original);

      const updated = original.withName('Actualizado');
      repository.save(updated);

      const loaded = repository.load('b1');
      expect(loaded!.name).toBe('Actualizado');
    });
  });

  describe('loadAll', () => {
    it('returns all saved boards', () => {
      repository.save(createTestBoard('b1', 'Primero'));
      repository.save(createTestBoard('b2', 'Segundo'));

      const boards = repository.loadAll();

      expect(boards).toHaveLength(2);
      const names = boards.map((b) => b.name).sort();
      expect(names).toEqual(['Primero', 'Segundo']);
    });

    it('returns empty array when no boards exist', () => {
      expect(repository.loadAll()).toEqual([]);
    });
  });

  describe('delete', () => {
    it('removes a board from storage', () => {
      repository.save(createTestBoard());
      repository.delete('b1');

      expect(repository.load('b1')).toBeNull();
      expect(repository.exists('b1')).toBe(false);
    });
  });

  describe('exists', () => {
    it('returns true for an existing board', () => {
      repository.save(createTestBoard());

      expect(repository.exists('b1')).toBe(true);
    });

    it('returns false for a non-existent board', () => {
      expect(repository.exists('b1')).toBe(false);
    });
  });

  describe('active board', () => {
    it('stores and retrieves the active board ID', () => {
      repository.setActiveBoardId('b1');

      expect(repository.getActiveBoardId()).toBe('b1');
    });

    it('returns null when no active board is set', () => {
      expect(repository.getActiveBoardId()).toBeNull();
    });
  });

  describe('data integrity', () => {
    it('preserves deeply nested tree structure through serialization', () => {
      const deep = CommunicationBoard.create('deep', 'Profundo', [
        BoardNode.create('l1', 'Nivel 1', 0, [
          BoardNode.create('l2', 'Nivel 2', 0, [
            BoardNode.create('l3', 'Nivel 3', 0, [
              BoardNode.create('leaf', 'Hoja profunda', 0),
            ]),
          ]),
        ]),
      ]);
      repository.save(deep);

      const loaded = repository.load('deep')!;
      const leaf = loaded.rootNodeAt(0)?.childAt(0)?.childAt(0)?.childAt(0);

      expect(leaf?.label).toBe('Hoja profunda');
      expect(leaf?.isMessage()).toBe(true);
    });

    it('handles corrupted localStorage gracefully', () => {
      localStorage.setItem('comq:boards:v1', 'not valid json');

      expect(repository.loadAll()).toEqual([]);
      expect(repository.load('any')).toBeNull();
    });
  });
});
