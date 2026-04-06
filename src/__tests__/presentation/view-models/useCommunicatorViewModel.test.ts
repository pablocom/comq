import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BoardNode } from '@domain/entities/BoardNode';
import { CommunicationBoard } from '@domain/entities/CommunicationBoard';
import { ScanningDomainService } from '@domain/services/ScanningDomainService';
import { UtteranceComposer } from '@domain/services/UtteranceComposer';
import { ScanningAppService } from '@application/services/ScanningAppService';
import type { BoardEditorService } from '@application/services/BoardEditorService';
import type { IVoiceOutputPort } from '@application/ports/IVoiceOutputPort';
import type { IHapticFeedbackPort } from '@application/ports/IHapticFeedbackPort';
import { useCommunicatorViewModel } from '@presentation/view-models/useCommunicatorViewModel';

function createMockVoiceOutput(): IVoiceOutputPort {
  return { speak: vi.fn(), cancel: vi.fn(), isAvailable: vi.fn(() => true) };
}

function createMockHapticFeedback(): IHapticFeedbackPort {
  return { vibrate: vi.fn(), vibratePattern: vi.fn(), isAvailable: vi.fn(() => true) };
}

function createTestBoard(): CommunicationBoard {
  return CommunicationBoard.create('test', 'Test', [
    BoardNode.create('cat', 'Necesidades', 0, [
      BoardNode.create('msg1', 'Tengo hambre', 0),
      BoardNode.create('msg2', 'Tengo sed', 1),
    ]),
    BoardNode.create('emotions', 'Emociones', 1, [
      BoardNode.create('sad', 'Estoy triste', 0),
    ]),
  ]);
}

describe('useCommunicatorViewModel', () => {
  let scanningService: ScanningAppService;
  let boardEditorService: BoardEditorService;

  beforeEach(() => {
    scanningService = new ScanningAppService(
      new ScanningDomainService(),
      new UtteranceComposer(),
      createMockVoiceOutput(),
      createMockHapticFeedback(),
    );

    const testBoard = createTestBoard();
    boardEditorService = {
      loadActiveBoard: vi.fn(() => testBoard),
    } as unknown as BoardEditorService;
  });

  it('initializes with the first root node label', () => {
    const { result } = renderHook(() =>
      useCommunicatorViewModel(scanningService, boardEditorService),
    );

    expect(result.current.isReady).toBe(true);
    expect(result.current.currentLabel).toBe('Necesidades');
    expect(result.current.isAtMessage).toBe(false);
  });

  it('advances to the next sibling on scanNext', () => {
    const { result } = renderHook(() =>
      useCommunicatorViewModel(scanningService, boardEditorService),
    );

    act(() => result.current.handleScanNext());

    expect(result.current.currentLabel).toBe('Emociones');
  });

  it('enters a category on select', () => {
    const { result } = renderHook(() =>
      useCommunicatorViewModel(scanningService, boardEditorService),
    );

    act(() => result.current.handleSelect());

    expect(result.current.currentLabel).toBe('Tengo hambre');
    expect(result.current.pathLabels).toContain('Necesidades');
  });

  it('produces an utterance when selecting a message', () => {
    const { result } = renderHook(() =>
      useCommunicatorViewModel(scanningService, boardEditorService),
    );

    act(() => result.current.handleSelect()); // enter Necesidades
    act(() => result.current.handleSelect()); // select "Tengo hambre"

    expect(result.current.lastUtterance).toBe('Necesidades, Tengo hambre');
  });

  it('resets to root on dismiss after selecting a message', () => {
    const { result } = renderHook(() =>
      useCommunicatorViewModel(scanningService, boardEditorService),
    );

    act(() => result.current.handleSelect()); // enter Necesidades
    act(() => result.current.handleSelect()); // select "Tengo hambre"
    expect(result.current.lastUtterance).toBe('Necesidades, Tengo hambre');

    act(() => result.current.dismissUtterance());
    expect(result.current.lastUtterance).toBeNull();
    expect(result.current.isAtRoot).toBe(true);
    expect(result.current.currentLabel).toBe('Necesidades');
  });

  it('goes back to parent level on goBack', () => {
    const { result } = renderHook(() =>
      useCommunicatorViewModel(scanningService, boardEditorService),
    );

    act(() => result.current.handleSelect()); // enter Necesidades
    expect(result.current.isAtRoot).toBe(false);

    act(() => result.current.handleGoBack());
    expect(result.current.isAtRoot).toBe(true);
    expect(result.current.currentLabel).toBe('Necesidades');
  });
});
