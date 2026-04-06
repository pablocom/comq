export interface IHapticFeedbackPort {
  vibrate(durationMs: number): void;
  vibratePattern(pattern: number[]): void;
  isAvailable(): boolean;
}
