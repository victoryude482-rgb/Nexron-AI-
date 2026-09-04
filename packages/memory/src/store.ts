export interface Memory {
  id: string;
  scope: "user" | "project" | "conversation";
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryStore {
  put(memory: Memory): Promise<void>;
  search(scope: Memory["scope"], query: string, limit?: number): Promise<Memory[]>;
}

export class InMemoryStore implements MemoryStore {
  private readonly items: Memory[] = [];
  async put(memory: Memory) {
    const index = this.items.findIndex(x => x.scope === memory.scope && x.key === memory.key);
    if (index >= 0) this.items[index] = memory; else this.items.push(memory);
  }
  async search(scope: Memory["scope"], query: string, limit = 10) {
    const q = query.toLowerCase();
    return this.items.filter(x => x.scope === scope && (x.key.toLowerCase().includes(q) || x.value.toLowerCase().includes(q))).slice(0, limit);
  }
}