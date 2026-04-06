import { useState, useCallback, useEffect } from 'react';
import type { BoardEditorService } from '@application/services/BoardEditorService';
import type { CommunicationBoard } from '@domain/entities/CommunicationBoard';

interface BoardEditorState {
  boards: CommunicationBoard[];
  activeBoardId: string | null;
  activeBoard: CommunicationBoard | null;
  editingNodeId: string | null;
}

export function useBoardEditorViewModel(boardEditorService: BoardEditorService) {
  const [state, setState] = useState<BoardEditorState>({
    boards: [],
    activeBoardId: null,
    activeBoard: null,
    editingNodeId: null,
  });

  const refreshState = useCallback(() => {
    const boards = boardEditorService.loadAllBoards();
    const active = boardEditorService.loadActiveBoard();
    setState((prev) => ({
      ...prev,
      boards,
      activeBoardId: active.id,
      activeBoard: active,
    }));
  }, [boardEditorService]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const createBoard = useCallback(
    (name: string) => {
      boardEditorService.createBoard(name);
      refreshState();
    },
    [boardEditorService, refreshState],
  );

  const switchActiveBoard = useCallback(
    (boardId: string) => {
      boardEditorService.setActiveBoard(boardId);
      refreshState();
    },
    [boardEditorService, refreshState],
  );

  const renameBoard = useCallback(
    (boardId: string, name: string) => {
      boardEditorService.renameBoard(boardId, name);
      refreshState();
    },
    [boardEditorService, refreshState],
  );

  const deleteBoard = useCallback(
    (boardId: string) => {
      boardEditorService.deleteBoard(boardId);
      refreshState();
    },
    [boardEditorService, refreshState],
  );

  const addNode = useCallback(
    (parentId: string | null) => {
      if (!state.activeBoardId) return;
      const updated = boardEditorService.addNode(state.activeBoardId, parentId, '');
      // Find the newly added node (last child of parent, or last root)
      let newNodeId: string | undefined;
      if (parentId === null) {
        newNodeId = updated.rootNodeAt(updated.rootNodeCount() - 1)?.id;
      } else {
        const parent = updated.findNodeById(parentId);
        newNodeId = parent?.childAt(parent.childCount() - 1)?.id;
      }
      setState((prev) => ({ ...prev, editingNodeId: newNodeId ?? null }));
      refreshState();
      // Re-set editingNodeId after refresh since refreshState clears nothing but re-derives state
      if (newNodeId) {
        setState((prev) => ({ ...prev, editingNodeId: newNodeId ?? null }));
      }
    },
    [boardEditorService, state.activeBoardId, refreshState],
  );

  const removeNode = useCallback(
    (nodeId: string) => {
      if (!state.activeBoardId) return;
      boardEditorService.removeNode(state.activeBoardId, nodeId);
      refreshState();
    },
    [boardEditorService, state.activeBoardId, refreshState],
  );

  const updateNodeLabel = useCallback(
    (nodeId: string, label: string) => {
      if (!state.activeBoardId) return;
      // If label is empty, remove the node (user cancelled creation)
      if (!label.trim()) {
        boardEditorService.removeNode(state.activeBoardId, nodeId);
      } else {
        boardEditorService.updateNodeLabel(state.activeBoardId, nodeId, label);
      }
      setState((prev) => ({ ...prev, editingNodeId: null }));
      refreshState();
    },
    [boardEditorService, state.activeBoardId, refreshState],
  );

  const startEditingNode = useCallback((nodeId: string) => {
    setState((prev) => ({ ...prev, editingNodeId: nodeId }));
  }, []);

  const cancelEditingNode = useCallback(() => {
    setState((prev) => ({ ...prev, editingNodeId: null }));
  }, []);

  const moveNode = useCallback(
    (nodeId: string, targetParentId: string | null, targetIndex: number) => {
      if (!state.activeBoardId) return;
      boardEditorService.moveNode(state.activeBoardId, nodeId, targetParentId, targetIndex);
      refreshState();
    },
    [boardEditorService, state.activeBoardId, refreshState],
  );

  return {
    boards: state.boards,
    activeBoardId: state.activeBoardId,
    activeBoard: state.activeBoard,
    editingNodeId: state.editingNodeId,
    createBoard,
    switchActiveBoard,
    renameBoard,
    deleteBoard,
    addNode,
    removeNode,
    updateNodeLabel,
    startEditingNode,
    cancelEditingNode,
    moveNode,
  };
}
