import { useState, useCallback } from 'react';
import type { BoardSharingService, ImportPreview } from '@application/services/BoardSharingService';
import type { BoardEditorService } from '@application/services/BoardEditorService';
import type { ValidationError } from '@domain/validation/BoardValidator';

interface BoardSharingState {
  exportJson: string | null;
  importJson: string;
  importPreview: ImportPreview | null;
  importErrors: ValidationError[];
  importSuccess: boolean;
  copySuccess: boolean;
}

export function useBoardSharingViewModel(
  boardSharingService: BoardSharingService,
  boardEditorService: BoardEditorService,
) {
  const [state, setState] = useState<BoardSharingState>({
    exportJson: null,
    importJson: '',
    importPreview: null,
    importErrors: [],
    importSuccess: false,
    copySuccess: false,
  });

  const boardCount = boardEditorService.loadAllBoards().length;

  const handleExport = useCallback(() => {
    const json = boardSharingService.exportAll();
    setState((prev) => ({ ...prev, exportJson: json, copySuccess: false }));
  }, [boardSharingService]);

  const handleDownload = useCallback(() => {
    const blob = boardSharingService.exportAllAsBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comq-tableros.comq.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [boardSharingService]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!state.exportJson) return;
    try {
      await navigator.clipboard.writeText(state.exportJson);
      setState((prev) => ({ ...prev, copySuccess: true }));
    } catch {
      // Clipboard API not available
    }
  }, [state.exportJson]);

  const handleImportJsonChange = useCallback((json: string) => {
    setState((prev) => ({
      ...prev,
      importJson: json,
      importPreview: null,
      importErrors: [],
      importSuccess: false,
    }));
  }, []);

  const handleValidateImport = useCallback(() => {
    const result = boardSharingService.parseAndValidate(state.importJson);
    if (result.success) {
      setState((prev) => ({ ...prev, importPreview: result.value, importErrors: [] }));
    } else {
      setState((prev) => ({ ...prev, importPreview: null, importErrors: result.errors }));
    }
  }, [boardSharingService, state.importJson]);

  const handleConfirmImport = useCallback(() => {
    if (!state.importPreview) return;
    boardSharingService.importAll(state.importPreview);
    setState((prev) => ({
      ...prev,
      importJson: '',
      importPreview: null,
      importErrors: [],
      importSuccess: true,
    }));
  }, [boardSharingService, state.importPreview]);

  const handleFileImport = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setState((prev) => ({
          ...prev,
          importJson: content,
          importPreview: null,
          importErrors: [],
          importSuccess: false,
        }));
        const result = boardSharingService.parseAndValidate(content);
        if (result.success) {
          setState((prev) => ({ ...prev, importPreview: result.value, importErrors: [] }));
        } else {
          setState((prev) => ({ ...prev, importPreview: null, importErrors: result.errors }));
        }
      };
      reader.readAsText(file);
    },
    [boardSharingService],
  );

  return {
    boardCount,
    exportJson: state.exportJson,
    importJson: state.importJson,
    importPreview: state.importPreview,
    importErrors: state.importErrors,
    importSuccess: state.importSuccess,
    copySuccess: state.copySuccess,
    handleExport,
    handleDownload,
    handleCopyToClipboard,
    handleImportJsonChange,
    handleValidateImport,
    handleConfirmImport,
    handleFileImport,
  };
}
