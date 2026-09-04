# Nexron Provider Layer

Nexron uses an OpenAI-compatible adapter as the common transport boundary where providers expose compatible chat-completions APIs.

Providers use PREFIX_BASE_URL, PREFIX_API_KEY, PREFIX_MODEL, PREFIX_NAME, PREFIX_CAPABILITIES, PREFIX_FREE, PREFIX_ENABLED and optional PREFIX_CONTEXT_WINDOW.

The router ranks providers by capability, free-first policy, preference, health and circuit state.

API keys are environment-only and never committed. Non-compatible APIs receive dedicated ModelProvider adapters.

LocalAI remains an external model server rather than being embedded into the gateway.
