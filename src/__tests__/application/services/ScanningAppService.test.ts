import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BoardNode } from '@domain/entities/BoardNode';
import { CommunicationBoard } from '@domain/entities/CommunicationBoard';
import { ScanState } from '@domain/value-objects/ScanState';
import { ScanningDomainService } from '@domain/services/ScanningDomainService';
import { UtteranceComposer } from '@domain/services/UtteranceComposer';
import { ScanningAppService } from '@application/services/ScanningAppService';
import type { IVoiceOutputPort } from '@application/ports/IVoiceOutputPort';
import type { IHapticFeedbackPort } from '@application/ports/IHapticFeedbackPort';

function createMockVoiceOutput(): IVoiceOutputPort {
  return {
    speak: vi.fn(),
    cancel: vi.fn(),
    isAvailable: vi.fn(() => true),
  };
}

function createMockHapticFeedback(): IHapticFeedbackPort {
  return {
    vibrate: vi.fn(),
    vibratePattern: vi.fn(),
    isAvailable: vi.fn(() => true),
  };
}

describe('ScanningAppService', () => {
  let service: ScanningAppService;
  let voiceOutput: IVoiceOutputPort;
  let hapticFeedback: IHapticFeedbackPort;
  let board: CommunicationBoard;

  beforeEach(() => {
    voiceOutput = createMockVoiceOutput();
    hapticFeedback = createMockHapticFeedback();
    service = new ScanningAppService(
      new ScanningDomainService(),
      new UtteranceComposer(),
      voiceOutput,
      hapticFeedback,
    );
    board = CommunicationBoard.create('test', 'Test', [
      BoardNode.create('cat', 'Necesidades', 0, [
        BoardNode.create('msg', 'Tengo hambre', 0),
      ]),
      BoardNode.create('emotions', 'Emociones', 1, [
        BoardNode.create('sad', 'Estoy triste', 0),
      ]),
    ]);
  });

  describe('initialize', () => {
    it('speaks the first root node label on initialization', () => {
      const output = service.initialize(board);

      expect(output).not.toBeNull();
      expect(output!.label).toBe('Necesidades');
      expect(voiceOutput.speak).toHaveBeenCalledWith('Necesidades', 'es-ES');
    });

    it('returns null for an empty board', () => {
      const emptyBoard = CommunicationBoard.create('empty', 'Vacío');
      const output = service.initialize(emptyBoard);

      expect(output).toBeNull();
    });
  });

  describe('scanNext', () => {
    it('triggers haptic feedback on scan', () => {
      const state = ScanState.initial();
      service.scanNext(board, state);

      expect(hapticFeedback.vibrate).toHaveBeenCalledWith(30);
    });

    it('speaks the next node label via voice output', () => {
      const state = ScanState.initial();
      const output = service.scanNext(board, state);

      expect(output.label).toBe('Emociones');
      expect(voiceOutput.speak).toHaveBeenCalledWith('Emociones', 'es-ES');
    });

    it('returns the updated scan state', () => {
      const state = ScanState.initial();
      const output = service.scanNext(board, state);

      expect(output.state.currentIndex).toBe(1);
    });
  });

  describe('select', () => {
    it('triggers haptic feedback on selection', () => {
      const state = ScanState.initial();
      service.select(board, state);

      expect(hapticFeedback.vibrate).toHaveBeenCalledWith(100);
    });

    it('enters a category and speaks the first child', () => {
      const state = ScanState.initial();
      const result = service.select(board, state);

      expect(result.kind).toBe('entered-category');
      expect(voiceOutput.speak).toHaveBeenCalledWith('Tengo hambre', 'es-ES');
    });

    it('produces an utterance with full path when selecting a message', () => {
      const state = ScanState.initial().enterCategory('cat');
      const result = service.select(board, state);

      expect(result.kind).toBe('selected-message');
      if (result.kind === 'selected-message') {
        expect(result.output.utterance.fullPhrase).toBe('Necesidades, Tengo hambre');
        expect(result.output.utterance.messageLabel).toBe('Tengo hambre');
        expect(voiceOutput.speak).toHaveBeenCalledWith('Necesidades, Tengo hambre', 'es-ES');
      }
    });
  });

  describe('goBack', () => {
    it('triggers haptic feedback on going back', () => {
      const state = ScanState.initial().enterCategory('cat');
      service.goBack(board, state);

      expect(hapticFeedback.vibrate).toHaveBeenCalledWith(50);
    });

    it('speaks the parent level node when going back', () => {
      const state = ScanState.initial().enterCategory('cat');
      const output = service.goBack(board, state);

      expect(output.label).toBe('Necesidades');
      expect(voiceOutput.speak).toHaveBeenCalledWith('Necesidades', 'es-ES');
    });
  });
});
