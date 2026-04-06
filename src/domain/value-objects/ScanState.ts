export class ScanState {
  readonly currentPath: ReadonlyArray<string>;
  readonly currentIndex: number;

  constructor(currentPath: string[], currentIndex: number) {
    this.currentPath = [...currentPath];
    this.currentIndex = currentIndex;
  }

  get depth(): number {
    return this.currentPath.length;
  }

  isAtRoot(): boolean {
    return this.currentPath.length === 0;
  }

  withIndex(index: number): ScanState {
    return new ScanState([...this.currentPath], index);
  }

  enterCategory(categoryId: string): ScanState {
    return new ScanState([...this.currentPath, categoryId], 0);
  }

  goBack(): ScanState {
    if (this.isAtRoot()) return this;
    const parentPath = this.currentPath.slice(0, -1);
    return new ScanState([...parentPath], 0);
  }

  static initial(): ScanState {
    return new ScanState([], 0);
  }
}
