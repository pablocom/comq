import type { IVoiceOutputPort } from '@application/ports/IVoiceOutputPort';

export class WebSpeechVoiceOutput implements IVoiceOutputPort {
  private synthesis: SpeechSynthesis | null;

  constructor() {
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
  }

  speak(text: string, locale: string): void {
    if (!this.synthesis) return;

    this.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voice = this.findVoice(locale);
    if (voice) {
      utterance.voice = voice;
    }

    this.synthesis.speak(utterance);
  }

  cancel(): void {
    this.synthesis?.cancel();
  }

  isAvailable(): boolean {
    return this.synthesis !== null;
  }

  private findVoice(locale: string): SpeechSynthesisVoice | null {
    if (!this.synthesis) return null;

    const voices = this.synthesis.getVoices();
    const exactMatch = voices.find((v) => v.lang === locale);
    if (exactMatch) return exactMatch;

    const langPrefix = locale.split('-')[0]!;
    const partialMatch = voices.find((v) => v.lang.startsWith(langPrefix));
    return partialMatch ?? null;
  }
}
