export class Emitter<TEvents extends Record<string, (...a: any[]) => void>> {
  private m = new Map<keyof TEvents, Set<TEvents[keyof TEvents]>>();

  on<K extends keyof TEvents>(type: K, cb: TEvents[K]) {
    const set = this.m.get(type) ?? new Set();
    set.add(cb as any);
    this.m.set(type, set);
    return () => this.off(type, cb);
  }

  off<K extends keyof TEvents>(type: K, cb: TEvents[K]) {
    const set = this.m.get(type);
    if (!set) return;
    set.delete(cb as any);
  }

  emit<K extends keyof TEvents>(type: K, ...args: Parameters<TEvents[K]>) {
    const set = this.m.get(type);
    if (!set) return;
    for (const cb of Array.from(set)) (cb as any)(...args);
  }

  clear() { this.m.clear(); }
}
