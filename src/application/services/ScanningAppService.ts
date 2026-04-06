import { CommunicationBoard } from '@domain/entities/CommunicationBoard';
import { ScanningDomainService } from '@domain/services/ScanningDomainService';
import { UtteranceComposer } from '@domain/services/UtteranceComposer';
import { ScanState } from '@domain/value-objects/ScanState';
import { Utterance } from '@domain/value-objects/Utterance';
import type { IVoiceOutputPort } from '../ports/IVoiceOutputPort';
import type { IHapticFeedbackPort } from '../ports/IHapticFeedbackPort';
import type { ScanResult, SelectionResult } from '@domain/services/ScanningDomainService';

export interface ScanningOutput {
  state: ScanState;
  label: string;
  icon: string;
  pathLabels: string[];
  isAtMessage: boolean;
}

export interface MessageSelectedOutput {
  utterance: Utterance;
  state: ScanState;
}

const SCAN_VIBRATION_MS = 30;
const SELECT_VIBRATION_MS = 100;
const BACK_VIBRATION_MS = 50;

export class ScanningAppService {
  constructor(
    private readonly scanningService: ScanningDomainService,
    private readonly utteranceComposer: UtteranceComposer,
    private readonly voiceOutput: IVoiceOutputPort,
    private readonly hapticFeedback: IHapticFeedbackPort,
  ) {}

  initialize(board: CommunicationBoard): ScanningOutput | null {
    const state = ScanState.initial();
    const currentNode = this.scanningService.resolveCurrentNode(board, state);
    if (!currentNode) return null;

    this.voiceOutput.speak(currentNode.label, board.locale);
    return {
      state,
      label: currentNode.label,
      icon: currentNode.displayIcon(),
      pathLabels: [],
      isAtMessage: currentNode.isMessage(),
    };
  }

  scanNext(board: CommunicationBoard, currentState: ScanState): ScanningOutput {
    const result: ScanResult = this.scanningService.scanNext(board, currentState);

    this.hapticFeedback.vibrate(SCAN_VIBRATION_MS);
    this.voiceOutput.speak(result.currentNode.label, board.locale);

    return {
      state: result.state,
      label: result.currentNode.label,
      icon: result.currentNode.displayIcon(),
      pathLabels: this.scanningService.buildPathLabels(board, result.state),
      isAtMessage: result.currentNode.isMessage(),
    };
  }

  select(
    board: CommunicationBoard,
    currentState: ScanState,
  ): { kind: 'entered-category'; output: ScanningOutput } | { kind: 'selected-message'; output: MessageSelectedOutput } {
    const result: SelectionResult = this.scanningService.select(board, currentState);

    this.hapticFeedback.vibrate(SELECT_VIBRATION_MS);

    if (result.kind === 'entered-category') {
      this.voiceOutput.speak(result.currentNode.label, board.locale);
      return {
        kind: 'entered-category',
        output: {
          state: result.state,
          label: result.currentNode.label,
          icon: result.currentNode.displayIcon(),
          pathLabels: this.scanningService.buildPathLabels(board, result.state),
          isAtMessage: result.currentNode.isMessage(),
        },
      };
    }

    const pathLabels = this.scanningService.buildPathLabels(board, currentState);
    const utterance = this.utteranceComposer.compose(result.currentNode, pathLabels);
    this.voiceOutput.speak(utterance.fullPhrase, board.locale);

    return {
      kind: 'selected-message',
      output: {
        utterance,
        state: result.state,
      },
    };
  }

  goBack(board: CommunicationBoard, currentState: ScanState): ScanningOutput {
    const result: ScanResult = this.scanningService.goBack(board, currentState);

    this.hapticFeedback.vibrate(BACK_VIBRATION_MS);
    this.voiceOutput.speak(result.currentNode.label, board.locale);

    return {
      state: result.state,
      label: result.currentNode.label,
      icon: result.currentNode.displayIcon(),
      pathLabels: this.scanningService.buildPathLabels(board, result.state),
      isAtMessage: result.currentNode.isMessage(),
    };
  }
}
