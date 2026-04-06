import { useState, useCallback, useEffect } from 'react';
import type { ScanningAppService, ScanningOutput } from '@application/services/ScanningAppService';
import type { BoardEditorService } from '@application/services/BoardEditorService';
import type { CommunicationBoard } from '@domain/entities/CommunicationBoard';
import { ScanState } from '@domain/value-objects/ScanState';

interface CommunicatorState {
  board: CommunicationBoard | null;
  scanState: ScanState;
  currentLabel: string;
  currentIcon: string;
  pathLabels: string[];
  isAtMessage: boolean;
  lastUtterance: string | null;
  isReady: boolean;
}

export function useCommunicatorViewModel(
  scanningService: ScanningAppService,
  boardEditorService: BoardEditorService,
) {
  const [state, setState] = useState<CommunicatorState>({
    board: null,
    scanState: ScanState.initial(),
    currentLabel: '',
    currentIcon: '',
    pathLabels: [],
    isAtMessage: false,
    lastUtterance: null,
    isReady: false,
  });

  useEffect(() => {
    const board = boardEditorService.loadActiveBoard();
    const output = scanningService.initialize(board);
    if (output) {
      setState({
        board,
        scanState: output.state,
        currentLabel: output.label,
        currentIcon: output.icon,
        pathLabels: output.pathLabels,
        isAtMessage: output.isAtMessage,
        lastUtterance: null,
        isReady: true,
      });
    } else {
      setState((prev) => ({ ...prev, board, isReady: true }));
    }
  }, [scanningService, boardEditorService]);

  const applyOutput = useCallback((output: ScanningOutput) => {
    setState((prev) => ({
      ...prev,
      scanState: output.state,
      currentLabel: output.label,
      currentIcon: output.icon,
      pathLabels: output.pathLabels,
      isAtMessage: output.isAtMessage,
      lastUtterance: null,
    }));
  }, []);

  const handleScanNext = useCallback(() => {
    if (!state.board) return;
    applyOutput(scanningService.scanNext(state.board, state.scanState));
  }, [state.board, state.scanState, scanningService, applyOutput]);

  const handleSelect = useCallback(() => {
    if (!state.board) return;
    const result = scanningService.select(state.board, state.scanState);

    if (result.kind === 'entered-category') {
      applyOutput(result.output);
    } else {
      setState((prev) => ({
        ...prev,
        scanState: result.output.state,
        lastUtterance: result.output.utterance.fullPhrase,
      }));
    }
  }, [state.board, state.scanState, scanningService, applyOutput]);

  const handleGoBack = useCallback(() => {
    if (!state.board) return;
    applyOutput(scanningService.goBack(state.board, state.scanState));
  }, [state.board, state.scanState, scanningService, applyOutput]);

  const dismissUtterance = useCallback(() => {
    if (!state.board) {
      setState((prev) => ({ ...prev, lastUtterance: null }));
      return;
    }
    const output = scanningService.initialize(state.board);
    if (output) {
      setState((prev) => ({
        ...prev,
        scanState: output.state,
        currentLabel: output.label,
        currentIcon: output.icon,
        pathLabels: output.pathLabels,
        isAtMessage: output.isAtMessage,
        lastUtterance: null,
      }));
    } else {
      setState((prev) => ({ ...prev, lastUtterance: null }));
    }
  }, [state.board, scanningService]);

  const isEmpty = state.isReady && !state.currentLabel;

  return {
    currentLabel: state.currentLabel,
    currentIcon: state.currentIcon,
    pathLabels: state.pathLabels,
    isAtMessage: state.isAtMessage,
    lastUtterance: state.lastUtterance,
    isReady: state.isReady,
    isEmpty,
    isAtRoot: state.scanState.isAtRoot(),
    handleScanNext,
    handleSelect,
    handleGoBack,
    dismissUtterance,
  };
}
