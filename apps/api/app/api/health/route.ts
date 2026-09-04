import { NextResponse } from "next/server";
import { providersFromEnv } from "@nexron/ai-router";

export const runtime = "nodejs";

export async function GET() {
  const providers = providersFromEnv(process.env);
  return NextResponse.json({
    ok: true,
    service: "nexron-api",
    providers: providers.map(provider => ({
      name: provider.descriptor.provider,
      model: provider.descriptor.id,
      capabilities: provider.descriptor.capabilities,
      free: provider.descriptor.free === true,
      enabled: provider.descriptor.enabled !== false,
    })),
  });
}