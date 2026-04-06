import { describe, it, expect } from 'vitest';
import { BoardNode } from '@domain/entities/BoardNode';

describe('BoardNode', () => {
  describe('creation', () => {
    it('creates a message node when no children are provided', () => {
      const node = BoardNode.create('n1', 'Tengo hambre', 0);

      expect(node.id).toBe('n1');
      expect(node.label).toBe('Tengo hambre');
      expect(node.order).toBe(0);
      expect(node.isMessage()).toBe(true);
      expect(node.isCategory()).toBe(false);
    });

    it('creates a category node when children are provided', () => {
      const child = BoardNode.create('c1', 'Tengo sed', 0);
      const category = BoardNode.create('cat1', 'Alimentación', 0, [child]);

      expect(category.isCategory()).toBe(true);
      expect(category.isMessage()).toBe(false);
      expect(category.childCount()).toBe(1);
    });
  });

  describe('child access', () => {
    it('returns the child at a given index', () => {
      const first = BoardNode.create('c1', 'Primero', 0);
      const second = BoardNode.create('c2', 'Segundo', 1);
      const parent = BoardNode.create('p', 'Padre', 0, [first, second]);

      expect(parent.childAt(0)?.label).toBe('Primero');
      expect(parent.childAt(1)?.label).toBe('Segundo');
    });

    it('returns undefined for an out-of-bounds index', () => {
      const node = BoardNode.create('n1', 'Solo', 0);

      expect(node.childAt(0)).toBeUndefined();
    });
  });

  describe('immutable mutations', () => {
    it('withLabel returns a new node with the updated label', () => {
      const original = BoardNode.create('n1', 'Original', 0);
      const updated = original.withLabel('Actualizado');

      expect(updated.label).toBe('Actualizado');
      expect(original.label).toBe('Original');
      expect(updated.id).toBe(original.id);
    });

    it('addChild returns a new node with the added child', () => {
      const parent = BoardNode.create('p', 'Padre', 0);
      const child = BoardNode.create('c', 'Hijo', 0);
      const updated = parent.addChild(child);

      expect(updated.childCount()).toBe(1);
      expect(updated.isCategory()).toBe(true);
      expect(parent.childCount()).toBe(0);
    });

    it('removeChild returns a new node without the removed child', () => {
      const child1 = BoardNode.create('c1', 'Primero', 0);
      const child2 = BoardNode.create('c2', 'Segundo', 1);
      const parent = BoardNode.create('p', 'Padre', 0, [child1, child2]);
      const updated = parent.removeChild('c1');

      expect(updated.childCount()).toBe(1);
      expect(updated.childAt(0)?.id).toBe('c2');
      expect(parent.childCount()).toBe(2);
    });

    it('withOrder returns a new node with the updated order', () => {
      const node = BoardNode.create('n1', 'Nodo', 0);
      const updated = node.withOrder(5);

      expect(updated.order).toBe(5);
      expect(node.order).toBe(0);
    });
  });

  describe('serialization', () => {
    it('toProps round-trips through the constructor', () => {
      const child = BoardNode.create('c1', 'Hijo', 0);
      const node = BoardNode.create('p', 'Padre', 1, [child]);
      const restored = new BoardNode(node.toProps());

      expect(restored.id).toBe(node.id);
      expect(restored.label).toBe(node.label);
      expect(restored.order).toBe(node.order);
      expect(restored.childCount()).toBe(1);
      expect(restored.childAt(0)?.id).toBe('c1');
    });
  });
});
