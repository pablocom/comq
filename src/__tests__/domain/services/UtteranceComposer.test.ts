import { describe, it, expect } from 'vitest';
import { BoardNode } from '@domain/entities/BoardNode';
import { UtteranceComposer } from '@domain/services/UtteranceComposer';

describe('UtteranceComposer', () => {
  const composer = new UtteranceComposer();

  it('composes the full decision path into a single phrase', () => {
    const message = BoardNode.create('m1', 'Tengo hambre', 0);
    const pathLabels = ['Necesidades Básicas', 'Alimentación'];
    const utterance = composer.compose(message, pathLabels);

    expect(utterance.fullPhrase).toBe('Necesidades Básicas, Alimentación, Tengo hambre');
    expect(utterance.messageLabel).toBe('Tengo hambre');
    expect(utterance.pathSegments).toEqual(['Necesidades Básicas', 'Alimentación']);
    expect(utterance.toString()).toBe('Necesidades Básicas, Alimentación, Tengo hambre');
  });

  it('uses only the message label when path is empty (root-level message)', () => {
    const message = BoardNode.create('m1', 'Sí', 0);
    const utterance = composer.compose(message, []);

    expect(utterance.fullPhrase).toBe('Sí');
    expect(utterance.pathSegments).toEqual([]);
  });

  it('throws when given a category node', () => {
    const child = BoardNode.create('c1', 'Hijo', 0);
    const category = BoardNode.create('cat', 'Categoría', 0, [child]);

    expect(() => composer.compose(category, [])).toThrow(
      'Cannot compose utterance from a category node',
    );
  });
});
