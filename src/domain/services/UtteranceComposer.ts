import { BoardNode } from '../entities/BoardNode';
import { Utterance } from '../value-objects/Utterance';

export class UtteranceComposer {
  compose(messageNode: BoardNode, pathLabels: string[]): Utterance {
    if (messageNode.isCategory()) {
      throw new Error('Cannot compose utterance from a category node');
    }

    const allSegments = [...pathLabels, messageNode.label];
    const fullPhrase = allSegments.join(', ');

    return new Utterance(pathLabels, messageNode.label, fullPhrase);
  }
}
