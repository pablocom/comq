export interface IVoiceOutputPort {
  speak(text: string, locale: string): void;
  cancel(): void;
  isAvailable(): boolean;
}
