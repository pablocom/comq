import { describe, it, expect } from 'vitest';
import { BoardNode } from '@domain/entities/BoardNode';
import { CommunicationBoard } from '@domain/entities/CommunicationBoard';

describe('CommunicationBoard', () => {
  const createTestBoard = () => {
    const message = BoardNode.create('m1', 'Tengo hambre', 0);
    const category = BoardNode.create('cat1', 'Alimentación', 0, [message]);
    return CommunicationBoard.create('board-1', 'Tablero de prueba', [category]);
  };

  describe('creation', () => {
    it('creates a board with the given name and root nodes', () => {
      const board = createTestBoard();

      expect(board.id).toBe('board-1');
      expect(board.name).toBe('Tablero de prueba');
      expect(board.locale).toBe('es-ES');
      expect(board.version).toBe(1);
      expect(board.rootNodeCount()).toBe(1);
    });

    it('creates an empty board when no root nodes are provided', () => {
      const board = CommunicationBoard.create('empty', 'Vacío');

      expect(board.isEmpty()).toBe(true);
      expect(board.rootNodeCount()).toBe(0);
    });

    it('sets timestamps on creation', () => {
      const board = createTestBoard();

      expect(board.createdAt).toBeTruthy();
      expect(board.updatedAt).toBeTruthy();
    });
  });

  describe('node access', () => {
    it('returns root node at a given index', () => {
      const board = createTestBoard();

      expect(board.rootNodeAt(0)?.label).toBe('Alimentación');
    });

    it('returns undefined for out-of-bounds root index', () => {
      const board = createTestBoard();

      expect(board.rootNodeAt(5)).toBeUndefined();
    });
  });

  describe('findNodeById', () => {
    it('finds a root-level node by id', () => {
      const board = createTestBoard();

      expect(board.findNodeById('cat1')?.label).toBe('Alimentación');
    });

    it('finds a deeply nested node by id', () => {
      const board = createTestBoard();

      expect(board.findNodeById('m1')?.label).toBe('Tengo hambre');
    });

    it('returns undefined for a non-existent id', () => {
      const board = createTestBoard();

      expect(board.findNodeById('nonexistent')).toBeUndefined();
    });
  });

  describe('immutable mutations', () => {
    it('withName returns a new board with updated name and timestamp', () => {
      const original = createTestBoard();
      const updated = original.withName('Nuevo nombre');

      expect(updated.name).toBe('Nuevo nombre');
      expect(original.name).toBe('Tablero de prueba');
      expect(updated.id).toBe(original.id);
    });

    it('addRootNode returns a new board with the added node', () => {
      const board = createTestBoard();
      const newNode = BoardNode.create('cat2', 'Emociones', 1);
      const updated = board.addRootNode(newNode);

      expect(updated.rootNodeCount()).toBe(2);
      expect(board.rootNodeCount()).toBe(1);
    });

    it('removeRootNode returns a new board without the removed node', () => {
      const board = createTestBoard();
      const updated = board.removeRootNode('cat1');

      expect(updated.isEmpty()).toBe(true);
      expect(board.rootNodeCount()).toBe(1);
    });
  });

  describe('serialization', () => {
    it('toProps round-trips through the constructor', () => {
      const board = createTestBoard();
      const restored = new CommunicationBoard(board.toProps());

      expect(restored.id).toBe(board.id);
      expect(restored.name).toBe(board.name);
      expect(restored.rootNodeCount()).toBe(1);
    });
  });
});
