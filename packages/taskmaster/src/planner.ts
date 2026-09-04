import type { AgentTask } from "@nexron/shared";

export function validateTaskGraph(tasks: AgentTask[]): void {
  const ids = new Set(tasks.map(t => t.id));
  for (const task of tasks) {
    for (const dep of task.dependsOn) {
      if (!ids.has(dep)) throw new Error(`Task ${task.id} depends on missing task ${dep}`);
      if (dep === task.id) throw new Error(`Task ${task.id} cannot depend on itself`);
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) throw new Error("Task graph contains a dependency cycle.");
    if (visited.has(id)) return;
    visiting.add(id);
    const task = tasks.find(t => t.id === id)!;
    task.dependsOn.forEach(visit);
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