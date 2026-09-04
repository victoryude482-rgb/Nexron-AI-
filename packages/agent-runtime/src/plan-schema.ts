import type { AgentTask, Capability } from "@nexron/shared";

const capabilities = new Set<Capability>(["chat","coding","research","browser","vision","tool_use","lead_intelligence"]);
export interface RawPlanTask {
  id: string;
  title: string;
  capability: Capability;
  dependsOn: string[];
  input?: unknown;
}

export interface RawAgentPlan {
  tasks: RawPlanTask[];
}

export function parseAgentPlan(value: unknown): AgentTask[] {
  if (!value || typeof value !== "object" || !Array.isArray((value as { tasks?: unknown }).tasks)) {
    throw new Error("Planner returned an invalid plan.");
  }

  const raw = (value as { tasks: unknown[] }).tasks;
  if (raw.length === 0 || raw.length > 32) throw new Error("Plan must contain between 1 and 32 tasks.");

  const tasks = raw.map((item, index): AgentTask => {
    if (!item || typeof item !== "object") throw new Error("Plan task " + index + " is invalid.");
    const task = item as Record<string, unknown>;
    if (typeof task.id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(task.id)) throw new Error("Invalid task ID.");
    if (typeof task.title !== "string" || task.title.length < 1 || task.title.length > 500) throw new Error("Invalid task title.");
    if (typeof task.capability !== "string" || !capabilities.has(task.capability as Capability)) throw new Error("Invalid task capability.");
    if (!Array.isArray(task.dependsOn) || task.dependsOn.some(dep => typeof dep !== "string")) throw new Error("Invalid task dependencies.");
    return {
      id: task.id,
      title: task.title,
      capability: task.capability as Capability,
      dependsOn: task.dependsOn as string[],
      status: "pending",
      ...(task.input === undefined ? {} : { input: task.input }),
    };
  });

  const ids = new Set(tasks.map(task => task.id));
  if (ids.size !== tasks.length) throw new Error("Plan contains duplicate task IDs.");
  for (const task of tasks) {
    if (task.dependsOn.includes(task.id)) throw new Error("A task cannot depend on itself.");
    for (const dep of task.dependsOn) if (!ids.has(dep)) throw new Error("Plan contains a missing dependency.");
  }
  return tasks;
}
