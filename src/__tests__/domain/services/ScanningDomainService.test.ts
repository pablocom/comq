import { describe, it, expect, beforeEach } from 'vitest';
import { BoardNode } from '@domain/entities/BoardNode';
import { CommunicationBoard } from '@domain/entities/CommunicationBoard';
import { ScanState } from '@domain/value-objects/ScanState';
import { ScanningDomainService } from '@domain/services/ScanningDomainService';

describe('ScanningDomainService', () => {
  let service: ScanningDomainService;
  let board: CommunicationBoard;

  beforeEach(() => {
    service = new ScanningDomainService();
    board = CommunicationBoard.create('test-board', 'Tablero de prueba', [
      BoardNode.create('needs', 'Necesidades Básicas', 0, [
        BoardNode.create('food', 'Alimentación', 0, [
          BoardNode.create('hungry', 'Tengo hambre', 0),
          BoardNode.create('thirsty', 'Tengo sed', 1),
        ]),
        BoardNode.create('rest', 'Descanso', 1, [
          BoardNode.create('sleep', 'Quiero dormir', 0),
        ]),
      ]),
      BoardNode.create('emotions', 'Emociones', 1, [
        BoardNode.create('sad', 'Estoy triste', 0),
        BoardNode.create('happy', 'Estoy feliz', 1),
      ]),
      BoardNode.create('pain', 'Dolor', 2, [
        BoardNode.create('headache', 'Me duele la cabeza', 0),
      ]),
    ]);
  });

  describe('resolveCurrentNodes', () => {
    it('returns root nodes when scan state is at root', () => {
      const state = ScanState.initial();
      const nodes = service.resolveCurrentNodes(board, state);

      expect(nodes).toHaveLength(3);
      expect(nodes[0]?.label).toBe('Necesidades Básicas');
    });

    it('returns children when scan state is inside a category', () => {
      const state = ScanState.initial().enterCategory('needs');
      const nodes = service.resolveCurrentNodes(board, state);

      expect(nodes).toHaveLength(2);
      expect(nodes[0]?.label).toBe('Alimentación');
      expect(nodes[1]?.label).toBe('Descanso');
    });

    it('returns deeply nested children', () => {
      const state = ScanState.initial().enterCategory('needs').enterCategory('food');
      const nodes = service.resolveCurrentNodes(board, state);

      expect(nodes).toHaveLength(2);
      expect(nodes[0]?.label).toBe('Tengo hambre');
    });
  });

  describe('scanNext', () => {
    it('advances to the next sibling at the current level', () => {
      const state = ScanState.initial();
      const result = service.scanNext(board, state);

      expect(result.currentNode.label).toBe('Emociones');
      expect(result.state.currentIndex).toBe(1);
    });

    it('wraps to the first sibling after the last one', () => {
      const state = ScanState.initial().withIndex(2);
      const result = service.scanNext(board, state);

      expect(result.currentNode.label).toBe('Necesidades Básicas');
      expect(result.state.currentIndex).toBe(0);
    });

    it('stays on the only child when there is a single option', () => {
      const state = ScanState.initial().enterCategory('needs').enterCategory('rest');
      const result = service.scanNext(board, state);

      expect(result.currentNode.label).toBe('Quiero dormir');
      expect(result.state.currentIndex).toBe(0);
    });

    it('cycles through all siblings before wrapping', () => {
      let state = ScanState.initial();
      const labels: string[] = [];

      for (let i = 0; i < 4; i++) {
        const result = service.scanNext(board, state);
        labels.push(result.currentNode.label);
        state = result.state;
      }

      expect(labels).toEqual([
        'Emociones',
        'Dolor',
        'Necesidades Básicas',
        'Emociones',
      ]);
    });
  });

  describe('select', () => {
    it('enters a category and positions at its first child', () => {
      const state = ScanState.initial();
      const result = service.select(board, state);

      expect(result.kind).toBe('entered-category');
      expect(result.currentNode.label).toBe('Alimentación');
      expect(result.state.depth).toBe(1);
    });

    it('returns selected-message when selecting a leaf node', () => {
      const state = ScanState.initial().enterCategory('needs').enterCategory('food');
      const result = service.select(board, state);

      expect(result.kind).toBe('selected-message');
      expect(result.currentNode.label).toBe('Tengo hambre');
    });

    it('navigates deeply: root -> category -> subcategory -> message', () => {
      let state = ScanState.initial();

      // Select "Necesidades Básicas" (category)
      const r1 = service.select(board, state);
      expect(r1.kind).toBe('entered-category');
      state = r1.state;

      // Select "Alimentación" (subcategory)
      const r2 = service.select(board, state);
      expect(r2.kind).toBe('entered-category');
      state = r2.state;

      // Select "Tengo hambre" (message)
      const r3 = service.select(board, state);
      expect(r3.kind).toBe('selected-message');
      expect(r3.currentNode.label).toBe('Tengo hambre');
    });
  });

  describe('goBack', () => {
    it('returns to the parent level when inside a category', () => {
      const state = ScanState.initial().enterCategory('needs');
      const result = service.goBack(board, state);

      expect(result.state.isAtRoot()).toBe(true);
      expect(result.currentNode.label).toBe('Necesidades Básicas');
    });

    it('stays at root when already at root', () => {
      const state = ScanState.initial();
      const result = service.goBack(board, state);

      expect(result.state.isAtRoot()).toBe(true);
    });

    it('goes back one level from a deeply nested position', () => {
      const state = ScanState.initial().enterCategory('needs').enterCategory('food');
      const result = service.goBack(board, state);

      expect(result.state.depth).toBe(1);
      expect(result.currentNode.label).toBe('Alimentación');
    });
  });

  describe('buildPathLabels', () => {
    it('returns empty array at root', () => {
      const state = ScanState.initial();
      const labels = service.buildPathLabels(board, state);

      expect(labels).toEqual([]);
    });

    it('returns category labels along the path', () => {
      const state = ScanState.initial().enterCategory('needs').enterCategory('food');
      const labels = service.buildPathLabels(board, state);

      expect(labels).toEqual(['Necesidades Básicas', 'Alimentación']);
    });
  });
});
