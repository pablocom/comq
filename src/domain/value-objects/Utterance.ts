export class Utterance {
  readonly pathSegments: ReadonlyArray<string>;
  readonly messageLabel: string;
  readonly fullPhrase: string;

  constructor(pathSegments: string[], messageLabel: string, fullPhrase: string) {
    this.pathSegments = [...pathSegments];
    this.messageLabel = messageLabel;
    this.fullPhrase = fullPhrase;
  }

  toString(): string {
    return this.fullPhrase;
  }
}
