import { NextResponse } from "next/server";
import { getRuntime } from "../../../src/container.js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { message?: unknown };
    if (typeof body.message !== "string" || !body.message.trim()) {
      return NextResponse.json({ error: "message must be a non-empty string" }, { status: 400 });
    }
    if (body.message.length > 20000) {
      return NextResponse.json({ error: "message is too long" }, { status: 413 });
    }

    const controller = new AbortController();
    request.signal.addEventListener("abort", () => controller.abort(request.signal.reason), { once: true });
    const result = await getRuntime().run(body.message.trim(), { signal: controller.signal });

    return NextResponse.json({
      response: result.response.content,
      model: result.response.model,
      provider: result.response.provider,
      tasks: result.tasks.map(task => ({
        id: task.id, title: task.title, capability: task.capability,
        status: task.status, output: task.output, error: task.error,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}