
/**
 * This ManagedResizeObserver class creates a wrapper around the native 
 * ResizeObserver that keeps track of which elements are being observed. 
 * By keeping track of observed elements in a Set, we can ensure each element 
 * is only observed once.
 * @example
  let managedObserver = new ManagedResizeObserver(entries => {
    for (let entry of entries) {
      console.log(`Element ${entry.target.id} resized to ${entry.contentRect.width}`);
    }
  });
  let element = document.getElementById('your-element-id');
  managedObserver.observe(element);  // Will be observed
  managedObserver.observe(element);  // Will not be observed again
 */

type ResizeObserverCallback = (entries: ResizeObserverEntry[]) => void;

export class ManagedResizeObserver {
  private observer: ResizeObserver;
  private observedElements: Set<Element>;

  constructor(callback: ResizeObserverCallback) {
    this.observer = new ResizeObserver(callback);
    this.observedElements = new Set();
  }

  public observe(element: Element): void {
    if (!this.observedElements.has(element)) {
      this.observer.observe(element);
      this.observedElements.add(element);
    }
  }

  public unobserve(element: Element): void {
    if (this.observedElements.has(element)) {
      this.observer.unobserve(element);
      this.observedElements.delete(element);
    }
  }

  public disconnect(): void {
    this.observer.disconnect();
    this.observedElements.clear();
  }
}
