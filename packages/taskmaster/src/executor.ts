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
        if (state.some(task => task.status === "pending")) {
          throw new Error("Task graph is blocked or has unresolved dependencies.");
        }
        break;
      }

      const results = await Promise.allSettled(
        runnable.map(async task => {
          const index = state.findIndex(item => item.id === task.id);
          if (index < 0) throw new Error("Runnable task disappeared from execution state.");
          state[index] = { ...state[index], status: "running" };
          return this.handler.execute(state[index], context);
        }),
      );

      results.forEach((result, i) => {
        const task = runnable[i];
        if (!task) return;
        const index = state.findIndex(item => item.id === task.id);
        if (index < 0) return;

        state[index] = result.status === "fulfilled"
          ? result.value
          : {
              ...state[index],
              status: "failed",
              error: result.reason instanceof Error ? result.reason.message : String(result.reason),
            };
      });

      if (state.some(task => task.status === "failed")) break;
    }

    return state;
  }
}
