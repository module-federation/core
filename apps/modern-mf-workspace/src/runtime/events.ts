export interface TraceEvent {
  id: number;
  time: string;
  category: string;
  message: string;
  detail?: unknown;
}
export class TraceLog {
  events: TraceEvent[] = [];
  private listeners = new Set<() => void>();
  private sequence = 0;
  add = (category: string, message: string, detail?: unknown) => {
    this.events = [
      {
        id: ++this.sequence,
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        category,
        message,
        detail,
      },
      ...this.events,
    ].slice(0, 150);
    this.listeners.forEach((fn) => fn());
  };
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
}
