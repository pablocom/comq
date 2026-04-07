import { useState, useRef, useCallback, useEffect, type DragEvent } from 'react';
import type { BoardNode } from '@domain/entities/BoardNode';
import { HoldToConfirmButton } from '@presentation/components/shared/HoldToConfirmButton/HoldToConfirmButton';
import styles from './BoardTree.module.css';

interface DropTarget {
  kind: 'gap' | 'category';
  parentId: string | null;
  index: number;
  promoted: boolean;
}

interface BoardTreeProps {
  nodes: ReadonlyArray<BoardNode>;
  editingNodeId: string | null;
  onAddChild: (parentId: string | null) => void;
  onRemove: (nodeId: string) => void;
  onStartEdit: (nodeId: string) => void;
  onConfirmEdit: (nodeId: string, label: string) => void;
  onCancelEdit: () => void;
  onMoveNode: (nodeId: string, targetParentId: string | null, targetIndex: number) => void;
  parentId?: string | null;
  grandparentId?: string | null;
  indexInParent?: number;
  depth?: number;
}

export function BoardTree({
  nodes,
  editingNodeId,
  onAddChild,
  onRemove,
  onStartEdit,
  onConfirmEdit,
  onCancelEdit,
  onMoveNode,
  parentId = null,
  grandparentId = null,
  indexInParent = 0,
  depth = 0,
}: BoardTreeProps) {
  const ulRef = useRef<HTMLUListElement>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  useEffect(() => {
    setDraggedNodeId(null);
    setDropTarget(null);
  }, [nodes]);

  const handleDragStart = useCallback((e: DragEvent, nodeId: string) => {
    e.dataTransfer.setData('text/plain', nodeId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedNodeId(nodeId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedNodeId(null);
    setDropTarget(null);
  }, []);

  const resolveTarget = useCallback(
    (e: DragEvent, gapIndex: number): DropTarget => {
      if (depth > 0 && ulRef.current) {
        const ulLeft = ulRef.current.getBoundingClientRect().left;
        const clientX =
          e.clientX !== undefined && e.clientX !== 0
            ? e.clientX
            : (e.nativeEvent as any).clientX || (e.nativeEvent as any).touches?.[0]?.clientX || 0;

        if (clientX > 0 && clientX < ulLeft + 8) {
          return {
            kind: 'gap',
            parentId: grandparentId,
            index: indexInParent + 1,
            promoted: true,
          };
        }
      }
      return { kind: 'gap', parentId, index: gapIndex, promoted: false };
    },
    [depth, parentId, grandparentId, indexInParent],
  );

  const handleGapDragOver = useCallback(
    (e: DragEvent, gapIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      setDropTarget(resolveTarget(e, gapIndex));
    },
    [resolveTarget],
  );

  const handleDrop = useCallback(
    (e: DragEvent, gapIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      const nodeId = e.dataTransfer.getData('text/plain');
      if (nodeId) {
        const target = resolveTarget(e, gapIndex);
        onMoveNode(nodeId, target.parentId, target.index);
      }
      setDropTarget(null);
      setDraggedNodeId(null);
    },
    [onMoveNode, resolveTarget],
  );

  const handleDropOnCategory = useCallback(
    (e: DragEvent, categoryId: string) => {
      e.preventDefault();
      e.stopPropagation();
      const nodeId = e.dataTransfer.getData('text/plain');
      if (nodeId && nodeId !== categoryId) {
        onMoveNode(nodeId, categoryId, 0);
      }
      setDropTarget(null);
      setDraggedNodeId(null);
    },
    [onMoveNode],
  );

  const isGapActive = (index: number) =>
    dropTarget !== null &&
    !dropTarget.promoted &&
    dropTarget.kind === 'gap' &&
    dropTarget.parentId === parentId &&
    dropTarget.index === index;

  const isPromoted = dropTarget?.promoted === true;

  return (
    <ul
      ref={ulRef}
      className={styles.tree}
      style={{ paddingLeft: depth > 0 ? 'var(--tree-indent, 1.5rem)' : 0 }}
      onDragEnd={handleDragEnd}
    >
      {nodes.map((node, index) => (
        <li key={node.id} className={styles.node}>
          <div
            className={styles.dropZone}
            onDragOver={(e) => handleGapDragOver(e, index)}
            onDragLeave={() => setDropTarget(null)}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div
              className={`${styles.dropIndicator} ${isGapActive(index) ? styles.dropIndicatorActive : ''} ${isPromoted && dropTarget?.index === indexInParent + 1 && dropTarget?.parentId === grandparentId ? styles.dropIndicatorPromoted : ''}`}
            />
          </div>

          <BoardTreeNode
            node={node}
            nodeIndex={index}
            isDragging={draggedNodeId === node.id}
            isDropTargetCategory={dropTarget?.kind === 'category' && dropTarget.parentId === node.id}
            editingNodeId={editingNodeId}
            onAddChild={onAddChild}
            onRemove={onRemove}
            onStartEdit={onStartEdit}
            onConfirmEdit={onConfirmEdit}
            onCancelEdit={onCancelEdit}
            onMoveNode={onMoveNode}
            onDragStart={(e) => handleDragStart(e, node.id)}
            onDragEnd={handleDragEnd}
            onDropOnCategory={(e) => handleDropOnCategory(e, node.id)}
            onDragOverCategory={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropTarget({ kind: 'category', parentId: node.id, index: 0, promoted: false });
            }}
            onDragLeaveCategory={() => setDropTarget(null)}
            parentId={parentId}
            depth={depth}
          />
        </li>
      ))}

      <li className={styles.node}>
        <div
          className={styles.dropZone}
          onDragOver={(e) => handleGapDragOver(e, nodes.length)}
          onDragLeave={() => setDropTarget(null)}
          onDrop={(e) => handleDrop(e, nodes.length)}
        >
          <div
            className={`${styles.dropIndicator} ${isGapActive(nodes.length) ? styles.dropIndicatorActive : ''} ${isPromoted && dropTarget?.index === indexInParent + 1 && dropTarget?.parentId === grandparentId ? styles.dropIndicatorPromoted : ''}`}
          />
        </div>
      </li>
    </ul>
  );
}

interface BoardTreeNodeProps {
  node: BoardNode;
  nodeIndex: number;
  isDragging: boolean;
  isDropTargetCategory: boolean;
  editingNodeId: string | null;
  onAddChild: (parentId: string | null) => void;
  onRemove: (nodeId: string) => void;
  onStartEdit: (nodeId: string) => void;
  onConfirmEdit: (nodeId: string, label: string) => void;
  onCancelEdit: () => void;
  onMoveNode: (nodeId: string, targetParentId: string | null, targetIndex: number) => void;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
  onDropOnCategory: (e: DragEvent) => void;
  onDragOverCategory: (e: DragEvent) => void;
  onDragLeaveCategory: () => void;
  parentId: string | null;
  depth: number;
}

function BoardTreeNode({
  node,
  nodeIndex,
  isDragging,
  isDropTargetCategory,
  editingNodeId,
  onAddChild,
  onRemove,
  onStartEdit,
  onConfirmEdit,
  onCancelEdit,
  onMoveNode,
  onDragStart,
  onDragEnd,
  onDropOnCategory,
  onDragOverCategory,
  onDragLeaveCategory,
  parentId,
  depth,
}: BoardTreeNodeProps) {
  const isEditing = editingNodeId === node.id;
  const rowRef = useRef<HTMLDivElement>(null);
  const isEditingRef = useRef(isEditing);
  useEffect(() => { isEditingRef.current = isEditing; }, [isEditing]);

  // Use capture-phase touch listeners so we can synchronously toggle
  // `draggable` before the browser decides to start a drag gesture.
  // Capture fires top-down, BEFORE any child's stopPropagation takes effect,
  // which is why the old React-state approach (async) and the bubbling
  // onTouchStart approach (blocked by HoldToConfirmButton's stopPropagation)
  // both failed to prevent drag on mobile.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('button')) {
        row.draggable = false;
      }
    };

    const onTouchEnd = () => {
      // Brief delay so the browser fully cancels any in-progress drag gesture
      // before we re-enable draggable.
      setTimeout(() => {
        if (!isEditingRef.current) row.draggable = true;
      }, 80);
    };

    row.addEventListener('touchstart', onTouchStart, { capture: true });
    row.addEventListener('touchend', onTouchEnd, { capture: true });
    row.addEventListener('touchcancel', onTouchEnd, { capture: true });

    return () => {
      row.removeEventListener('touchstart', onTouchStart, { capture: true });
      row.removeEventListener('touchend', onTouchEnd, { capture: true });
      row.removeEventListener('touchcancel', onTouchEnd, { capture: true });
    };
  }, []);

  return (
    <>
      <div
        ref={rowRef}
        className={`${styles.nodeRow} ${isDragging ? styles.dragging : ''} ${isDropTargetCategory && node.isCategory() ? styles.dropTargetCategory : ''}`}
        draggable={!isEditing}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={node.isCategory() ? onDragOverCategory : undefined}
        onDragLeave={node.isCategory() ? onDragLeaveCategory : undefined}
        onDrop={node.isCategory() ? onDropOnCategory : undefined}
      >
        <span className={styles.nodeIcon} aria-hidden="true" draggable={false}>
          {node.displayIcon()}
        </span>

        {isEditing ? (
          <AutoFocusInput
            defaultValue={node.label}
            onConfirm={(value) => onConfirmEdit(node.id, value)}
            onCancel={onCancelEdit}
            ariaLabel="Editar etiqueta del nodo"
          />
        ) : (
          <span className={styles.nodeLabel} onDoubleClick={() => onStartEdit(node.id)}>
            {node.label}
          </span>
        )}

        <div className={styles.nodeActions}>
          <button
            className={styles.iconButton}
            onClick={() => onStartEdit(node.id)}
            aria-label="Editar"
            title="Editar"
          >
            ✏️
          </button>
          <button
            className={styles.iconButton}
            onClick={() => onAddChild(node.id)}
            aria-label="Agregar hijo"
            title="Agregar hijo"
          >
            +
          </button>
          <HoldToConfirmButton
            label="✕"
            holdDurationMs={1200}
            onConfirm={() => onRemove(node.id)}
            className={styles.deleteNodeButton}
          />
        </div>
      </div>

      {node.isCategory() && (
        <BoardTree
          nodes={node.children}
          editingNodeId={editingNodeId}
          onAddChild={onAddChild}
          onRemove={onRemove}
          onStartEdit={onStartEdit}
          onConfirmEdit={onConfirmEdit}
          onCancelEdit={onCancelEdit}
          onMoveNode={onMoveNode}
          parentId={node.id}
          grandparentId={parentId}
          indexInParent={nodeIndex}
          depth={depth + 1}
        />
      )}
    </>
  );
}

function AutoFocusInput({
  defaultValue,
  onConfirm,
  onCancel,
  ariaLabel,
}: {
  defaultValue: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  ariaLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      input.focus();
      input.select();
    }
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      className={styles.editInput}
      defaultValue={defaultValue}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onConfirm((e.target as HTMLInputElement).value);
        if (e.key === 'Escape') onCancel();
      }}
      onBlur={(e) => onConfirm(e.target.value)}
      aria-label={ariaLabel}
    />
  );
}
