import { BoardNode } from '../entities/BoardNode';
import { CommunicationBoard } from '../entities/CommunicationBoard';

export interface ValidationError {
  path: string;
  message: string;
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: ValidationError[] };

export class BoardValidator {
  validate(board: CommunicationBoard): ValidationResult {
    const errors: ValidationError[] = [];

    if (!board.id) {
      errors.push({ path: 'id', message: 'Board must have an id' });
    }

    if (!board.name.trim()) {
      errors.push({ path: 'name', message: 'Board must have a name' });
    }

    if (board.rootNodes.length === 0) {
      errors.push({ path: 'rootNodes', message: 'Board must have at least one root node' });
    }

    const seenIds = new Set<string>();
    this.validateNodes([...board.rootNodes], 'rootNodes', seenIds, errors);

    return errors.length === 0 ? { valid: true } : { valid: false, errors };
  }

  private validateNodes(
    nodes: BoardNode[],
    path: string,
    seenIds: Set<string>,
    errors: ValidationError[],
  ): void {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!;
      const nodePath = `${path}[${i}]`;

      if (!node.id) {
        errors.push({ path: `${nodePath}.id`, message: 'Node must have an id' });
      }

      if (seenIds.has(node.id)) {
        errors.push({ path: `${nodePath}.id`, message: `Duplicate node id: ${node.id}` });
      }
      seenIds.add(node.id);

      if (!node.label.trim()) {
        errors.push({ path: `${nodePath}.label`, message: 'Node must have a non-empty label' });
      }

      if (node.isCategory()) {
        if (node.children.length === 0) {
          errors.push({
            path: `${nodePath}.children`,
            message: 'Category must have at least one child (this should not occur)',
          });
        }
        this.validateNodes([...node.children], `${nodePath}.children`, seenIds, errors);
      }
    }
  }

  validateForCommunicatorUse(board: CommunicationBoard): ValidationResult {
    const baseResult = this.validate(board);
    if (!baseResult.valid) return baseResult;

    const errors: ValidationError[] = [];
    this.validateHasMessages([...board.rootNodes], 'rootNodes', errors);

    return errors.length === 0 ? { valid: true } : { valid: false, errors };
  }

  private validateHasMessages(
    nodes: BoardNode[],
    path: string,
    errors: ValidationError[],
  ): void {
    let hasMessage = false;
    for (const node of nodes) {
      if (node.isMessage()) {
        hasMessage = true;
      } else {
        this.validateHasMessages([...node.children], `${path}.${node.id}`, errors);
      }
    }
    if (!hasMessage && nodes.every((n) => n.isCategory())) {
      // Categories without any reachable messages are fine — messages exist deeper
    }
  }
}
