type CustomCallback = (element: HTMLElement | SVGElement) => void;

export class ManagedMutationObserver {
  private observer: MutationObserver;
  private observedElements: Set<Node>;
  
  constructor(private callback: CustomCallback) {
    this.observer = new MutationObserver((mutationsList: MutationRecord[]) => this.handleMutations(mutationsList));
    this.observedElements = new Set();
  }
  
  private handleMutations(mutationsList: MutationRecord[]): void {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const addedNode of Array.from(mutation.addedNodes)) {
          if (addedNode instanceof HTMLElement || addedNode instanceof SVGElement) {
            this.callback(addedNode);
          }
        }
      }
    }
  }
  
  public observe(element: Node): void {
    if (!this.observedElements.has(element)) {
      this.observer.observe(element, { childList: true, subtree: true });
      this.observedElements.add(element);
    }
  }
  
  public unobserve(element: Node): void {
    if (this.observedElements.has(element)) {
      this.observer.disconnect(); // Disconnect from all nodes
      this.observedElements.delete(element);
      // Re-observe remaining nodes
      this.observedElements.forEach((elem) => this.observer.observe(elem, { childList: true, subtree: true }));
    }
  }
  
  public disconnect(): void {
    this.observer.disconnect();
    this.observedElements.clear();
  }
}
