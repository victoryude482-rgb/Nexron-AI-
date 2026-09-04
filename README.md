# Nexron AI

Nexron is a modular AI workspace built around a planner, task graph executor, capability dispatcher, provider router, protected tools, and persistent conversations.

## Architecture
- Agent Runtime plans and executes work.
- Taskmaster validates dependency graphs and runs independent tasks concurrently.
- AI Router selects compatible providers with free-first routing, retry, circuit breaking, and streaming fallback.
- MCP layer exposes approved external tools through a registry.
- Lead Intelligence can connect to the existing LeadPilot service through an HTTP adapter.
- Memory supports in-memory development storage and Supabase persistence.
- Security provides request validation, rate limiting, CORS helpers, and server authentication boundaries.

## Backend endpoints
- GET /api/health
- POST /api/chat
- POST /api/chat/stream (SSE)
- GET /api/conversations
- POST /api/conversations
- GET /api/conversations/:id
- DELETE /api/conversations/:id

Set environment variables from .env.example. Never commit API keys or service-role credentials.

## Existing repositories
Nexron integrates through stable boundaries so the original repositories remain unchanged. LeadPilot can be connected with LEADPILOT_URL; other external agent/tool implementations can be exposed through MCP or compatible HTTP adapters.

## Production notes
Use a real identity provider for multi-user authentication and keep SUPABASE_SERVICE_ROLE_KEY server-side only. The included NEXRON_API_TOKEN is a service/API authentication boundary, not a replacement for a full user identity system.
