import { BoardNode, type BoardNodeProps } from '@domain/entities/BoardNode';
import { CommunicationBoard } from '@domain/entities/CommunicationBoard';
import type { IBoardRepository } from '@domain/repositories/IBoardRepository';
import { BoardValidator, type ValidationError } from '@domain/validation/BoardValidator';

export type ImportResult<T> =
  | { success: true; value: T }
  | { success: false; errors: ValidationError[] };

interface SerializedNode {
  id: string;
  label: string;
  children: SerializedNode[];
  order: number;
}

interface SerializedBoard {
  id: string;
  name: string;
  rootNodes: SerializedNode[];
  locale: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface SerializedExport {
  comqVersion: number;
  activeBoardId: string | null;
  boards: SerializedBoard[];
}

export interface ImportPreview {
  boards: CommunicationBoard[];
  activeBoardId: string | null;
}

export class BoardSharingService {
  private readonly validator = new BoardValidator();

  constructor(private readonly repository: IBoardRepository) {}

  exportAll(): string {
    const boards = this.repository.loadAll();
    const activeBoardId = this.repository.getActiveBoardId();
    const payload: SerializedExport = {
      comqVersion: 1,
      activeBoardId,
      boards: boards.map((b) => b.toProps() as unknown as SerializedBoard),
    };
    return JSON.stringify(payload, null, 2);
  }

  exportAllAsBlob(): Blob {
    const json = this.exportAll();
    return new Blob([json], { type: 'application/json' });
  }

  parseAndValidate(json: string): ImportResult<ImportPreview> {
    const parseResult = this.parseJson(json);
    if (!parseResult.success) return parseResult;

    const schemaResult = this.validateExportSchema(parseResult.value);
    if (!schemaResult.success) return schemaResult;

    const boards: CommunicationBoard[] = [];
    for (let i = 0; i < schemaResult.value.boards.length; i++) {
      const serialized = schemaResult.value.boards[i]!;
      const board = this.deserializeBoard(serialized);
      const domainResult = this.validator.validate(board);
      if (!domainResult.valid) {
        const prefixedErrors = domainResult.errors.map((e) => ({
          path: `boards[${i}].${e.path}`,
          message: `"${serialized.name}": ${e.message}`,
        }));
        return { success: false, errors: prefixedErrors };
      }
      boards.push(board);
    }

    return {
      success: true,
      value: { boards, activeBoardId: schemaResult.value.activeBoardId },
    };
  }

  importAll(preview: ImportPreview): void {
    for (const board of preview.boards) {
      this.repository.save(board);
    }
    if (preview.activeBoardId) {
      this.repository.setActiveBoardId(preview.activeBoardId);
    }
  }

  private parseJson(json: string): ImportResult<unknown> {
    try {
      const parsed: unknown = JSON.parse(json);
      return { success: true, value: parsed };
    } catch {
      return {
        success: false,
        errors: [{ path: 'root', message: 'El JSON no es válido. Verifica el formato.' }],
      };
    }
  }

  private validateExportSchema(data: unknown): ImportResult<SerializedExport> {
    const errors: ValidationError[] = [];

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      errors.push({ path: 'root', message: 'Se esperaba un objeto JSON' });
      return { success: false, errors };
    }

    const obj = data as Record<string, unknown>;

    if (!Array.isArray(obj['boards'])) {
      errors.push({ path: 'boards', message: 'Falta el campo "boards" o no es un arreglo' });
      return { success: false, errors };
    }

    const boards = obj['boards'] as unknown[];
    for (let i = 0; i < boards.length; i++) {
      this.validateBoardSchema(boards[i], `boards[${i}]`, errors);
    }

    if (boards.length === 0) {
      errors.push({ path: 'boards', message: 'El archivo no contiene tableros' });
    }

    if (errors.length > 0) return { success: false, errors };

    return {
      success: true,
      value: {
        comqVersion: (obj['comqVersion'] as number) ?? 1,
        activeBoardId: (obj['activeBoardId'] as string) ?? null,
        boards: boards as SerializedBoard[],
      },
    };
  }

  private validateBoardSchema(
    data: unknown,
    path: string,
    errors: ValidationError[],
  ): void {
    if (typeof data !== 'object' || data === null) {
      errors.push({ path, message: 'Tablero inválido' });
      return;
    }

    const obj = data as Record<string, unknown>;

    if (typeof obj['id'] !== 'string' || !obj['id']) {
      errors.push({ path: `${path}.id`, message: 'Falta el campo "id"' });
    }
    if (typeof obj['name'] !== 'string' || !obj['name']) {
      errors.push({ path: `${path}.name`, message: 'Falta el campo "name"' });
    }
    if (!Array.isArray(obj['rootNodes'])) {
      errors.push({ path: `${path}.rootNodes`, message: 'Falta el campo "rootNodes"' });
    } else {
      this.validateSerializedNodes(obj['rootNodes'] as unknown[], `${path}.rootNodes`, errors);
    }
  }

  private validateSerializedNodes(
    nodes: unknown[],
    path: string,
    errors: ValidationError[],
  ): void {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodePath = `${path}[${i}]`;

      if (typeof node !== 'object' || node === null) {
        errors.push({ path: nodePath, message: 'Nodo inválido' });
        continue;
      }

      const obj = node as Record<string, unknown>;

      if (typeof obj['id'] !== 'string') {
        errors.push({ path: `${nodePath}.id`, message: 'Falta el id del nodo' });
      }
      if (typeof obj['label'] !== 'string') {
        errors.push({ path: `${nodePath}.label`, message: 'Falta la etiqueta del nodo' });
      }

      if (Array.isArray(obj['children'])) {
        this.validateSerializedNodes(obj['children'] as unknown[], `${nodePath}.children`, errors);
      }
    }
  }

  private deserializeBoard(data: SerializedBoard): CommunicationBoard {
    const rootNodes = data.rootNodes.map((n) => this.deserializeNode(n));
    return new CommunicationBoard({
      id: data.id,
      name: data.name,
      rootNodes,
      locale: data.locale || 'es-ES',
      version: data.version || 1,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    });
  }

  private deserializeNode(data: SerializedNode): BoardNode {
    const children = (data.children || []).map((c) => this.deserializeNode(c));
    const props: BoardNodeProps = {
      id: data.id,
      label: data.label,
      children,
      order: data.order ?? 0,
    };
    return new BoardNode(props);
  }
}
