import type { IHapticFeedbackPort } from '@application/ports/IHapticFeedbackPort';

export class NavigatorHapticFeedback implements IHapticFeedbackPort {
  vibrate(durationMs: number): void {
    if (!this.isAvailable()) return;
    navigator.vibrate(durationMs);
  }

  vibratePattern(pattern: number[]): void {
    if (!this.isAvailable()) return;
    navigator.vibrate(pattern);
  }

  isAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }
}
