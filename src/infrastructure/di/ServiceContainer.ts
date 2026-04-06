import { ScanningDomainService } from '@domain/services/ScanningDomainService';
import { UtteranceComposer } from '@domain/services/UtteranceComposer';
import { ScanningAppService } from '@application/services/ScanningAppService';
import { BoardEditorService } from '@application/services/BoardEditorService';
import { BoardSharingService } from '@application/services/BoardSharingService';
import { LocalStorageBoardRepository } from '@infrastructure/persistence/LocalStorageBoardRepository';
import { WebSpeechVoiceOutput } from '@infrastructure/voice-output/WebSpeechVoiceOutput';
import { NavigatorHapticFeedback } from '@infrastructure/haptic-feedback/NavigatorHapticFeedback';

export interface Services {
  scanningAppService: ScanningAppService;
  boardEditorService: BoardEditorService;
  boardSharingService: BoardSharingService;
}

export function createServiceContainer(): Services {
  const boardRepository = new LocalStorageBoardRepository();
  const voiceOutput = new WebSpeechVoiceOutput();
  const hapticFeedback = new NavigatorHapticFeedback();

  const scanningDomainService = new ScanningDomainService();
  const utteranceComposer = new UtteranceComposer();

  const scanningAppService = new ScanningAppService(
    scanningDomainService,
    utteranceComposer,
    voiceOutput,
    hapticFeedback,
  );

  const boardEditorService = new BoardEditorService(boardRepository);
  const boardSharingService = new BoardSharingService(boardRepository);

  return {
    scanningAppService,
    boardEditorService,
    boardSharingService,
  };
}
