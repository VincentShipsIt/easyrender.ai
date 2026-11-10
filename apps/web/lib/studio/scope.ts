// Everything a section sets up (views, listeners, timers) is registered here so the component
// can tear it down on unmount. Async setup checks `alive` after each await.
export class Scope {
  alive = true;
  #cleanups: Array<() => void> = [];

  add(cleanup: () => void) {
    if (this.alive) this.#cleanups.push(cleanup);
    else cleanup();
  }

  on<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): void;
  on(
    target: EventTarget,
    type: string,
    handler: (event: Event) => void,
    options?: AddEventListenerOptions,
  ): void;
  on(
    target: EventTarget,
    type: string,
    handler: (event: never) => void,
    options?: AddEventListenerOptions,
  ) {
    const listener = handler as EventListener;
    target.addEventListener(type, listener, options);
    this.add(() => target.removeEventListener(type, listener, options));
  }

  timeout(fn: () => void, ms: number) {
    const id = setTimeout(() => {
      if (this.alive) fn();
    }, ms);
    this.add(() => clearTimeout(id));
  }

  // Resolves after `ms`, or immediately once the scope is gone.
  wait(ms: number) {
    return new Promise<void>((resolve) => {
      const id = setTimeout(resolve, ms);
      this.add(() => {
        clearTimeout(id);
        resolve();
      });
    });
  }

  dispose() {
    if (!this.alive) return;
    this.alive = false;
    for (const cleanup of this.#cleanups.splice(0).reverse()) cleanup();
  }
}
