import type { AgentTask } from "@nexron/shared";
import { nextRunnableTasks, validateTaskGraph } from "./planner.js";

export interface TaskExecutionContext {
  readonly signal?: AbortSignal;
}

export interface TaskHandler {
  execute(task: AgentTask, context: TaskExecutionContext): Promise<AgentTask>;
}

export class TaskExecutor {
  constructor(private readonly handler: TaskHandler) {}

  async run(tasks: AgentTask[], context: TaskExecutionContext = {}): Promise<AgentTask[]> {
    validateTaskGraph(tasks);
    const state = tasks.map(task => ({ ...task }));
    while (state.some(task => task.status === "pending" || task.status === "running")) {
      if (context.signal?.aborted) throw context.signal.reason;
      const runnable = nextRunnableTasks(state);
      if (!runnable.length) {
        const blocked = state.filter(task => task.status === "pending");
        if (blocked.length) {
          throw new Error("Task graph is blocked or has unresolved dependencies.");
        }
        break;
      }
      const results = await Promise.allSettled(
        runnable.map(async task => {
          const index = state.findIndex(item => item.id === task.id);
          state[index] = { ...state[index], status: "running" };
          return this.handler.execute(state[index], context);
        }),
      );
      results.forEach((result, i) => {
        const task = runnable[i];
        const index = state.findIndex(item => item.id === task.id);
        if (result.status === "fulfilled") state[index] = result.value;
        else state[index] = { ...state[index], status: "failed" };
      });
      if (state.some(task => task.status === "failed")) break;
    }
    return state;
  }
}
