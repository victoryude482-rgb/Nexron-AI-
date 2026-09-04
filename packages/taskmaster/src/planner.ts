import type { AgentTask } from "@nexron/shared";

export function validateTaskGraph(tasks: AgentTask[]): void {
  const ids = new Set(tasks.map(t => t.id));
  if (ids.size !== tasks.length) throw new Error("Task graph contains duplicate task IDs.");
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) throw new Error("Task graph contains a dependency cycle.");
    if (visited.has(id)) return;
    const task = tasks.find(t => t.id === id);
    if (!task) throw new Error("Task graph references a missing task.");
    visiting.add(id);
    for (const dep of task.dependsOn) {
      if (!ids.has(dep)) throw new Error("Task " + id + " depends on missing task " + dep);
      visit(dep);
    }
    visiting.delete(id);
    visited.add(id);
  };
  tasks.forEach(t => visit(t.id));
}

export function nextRunnableTasks(tasks: AgentTask[]): AgentTask[] {
  validateTaskGraph(tasks);
  const completed = new Set(tasks.filter(t => t.status === "completed").map(t => t.id));
  return tasks.filter(t => t.status === "pending" && t.dependsOn.every(d => completed.has(d)));
}
