type Listener = () => void;

class SimpleEmitter {
  private listeners: Map<string, Set<Listener>> = new Map();

  on(event: string, fn: Listener): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
    return () => this.listeners.get(event)?.delete(fn);
  }

  emit(event: string) {
    this.listeners.get(event)?.forEach(fn => fn());
    this.listeners.get('*')?.forEach(fn => fn());
  }
}

export const emitter = new SimpleEmitter();
