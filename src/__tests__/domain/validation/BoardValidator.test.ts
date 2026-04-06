import { describe, it, expect } from 'vitest';
import { BoardNode } from '@domain/entities/BoardNode';
import { CommunicationBoard } from '@domain/entities/CommunicationBoard';
import { BoardValidator } from '@domain/validation/BoardValidator';

describe('BoardValidator', () => {
  const validator = new BoardValidator();

  const createValidBoard = () =>
    CommunicationBoard.create('b1', 'Tablero válido', [
      BoardNode.create('cat1', 'Categoría', 0, [
        BoardNode.create('msg1', 'Mensaje', 0),
      ]),
    ]);

  describe('validate', () => {
    it('accepts a valid board with categories and messages', () => {
      const result = validator.validate(createValidBoard());

      expect(result.valid).toBe(true);
    });

    it('rejects a board with no root nodes', () => {
      const board = CommunicationBoard.create('b1', 'Vacío');
      const result = validator.validate(board);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContainEqual(
          expect.objectContaining({ message: 'Board must have at least one root node' }),
        );
      }
    });

    it('rejects a board with an empty name', () => {
      const board = CommunicationBoard.create('b1', '  ', [
        BoardNode.create('n1', 'Nodo', 0),
      ]);
      const result = validator.validate(board);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContainEqual(
          expect.objectContaining({ message: 'Board must have a name' }),
        );
      }
    });

    it('rejects a board with duplicate node ids', () => {
      const board = CommunicationBoard.create('b1', 'Duplicados', [
        BoardNode.create('same-id', 'Primero', 0),
        BoardNode.create('same-id', 'Segundo', 1),
      ]);
      const result = validator.validate(board);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContainEqual(
          expect.objectContaining({ message: 'Duplicate node id: same-id' }),
        );
      }
    });

    it('rejects nodes with empty labels', () => {
      const board = CommunicationBoard.create('b1', 'Etiquetas vacías', [
        BoardNode.create('n1', '  ', 0),
      ]);
      const result = validator.validate(board);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContainEqual(
          expect.objectContaining({ message: 'Node must have a non-empty label' }),
        );
      }
    });

    it('detects duplicate ids in nested nodes', () => {
      const board = CommunicationBoard.create('b1', 'Anidados', [
        BoardNode.create('cat', 'Categoría', 0, [
          BoardNode.create('dup', 'Hijo 1', 0),
        ]),
        BoardNode.create('dup', 'Duplicado en raíz', 1),
      ]);
      const result = validator.validate(board);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.message.includes('Duplicate'))).toBe(true);
      }
    });
  });

  describe('validateForCommunicatorUse', () => {
    it('accepts a board that passes all validation rules', () => {
      const result = validator.validateForCommunicatorUse(createValidBoard());

      expect(result.valid).toBe(true);
    });

    it('rejects boards that fail basic validation', () => {
      const board = CommunicationBoard.create('b1', 'Vacío');
      const result = validator.validateForCommunicatorUse(board);

      expect(result.valid).toBe(false);
    });
  });
});
