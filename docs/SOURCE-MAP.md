# Nexron Source Map

| Source | Nexron role | Strategy |
|---|---|---|
| leadpilot-ai / leadpilot-ai1 | Lead Intelligence | Adapt after source audit |
| Free-LLM-1 | AI Router | Adapt concepts |
| hermes-agent-1 | Agent Runtime | Adapter first |
| claudecodeui | Web workspace | Select UI patterns after review |
| browser-use | Browser worker | External/isolated adapter |
| openinterpreter | Execution | Sandboxed adapter |
| 500-AI-Agents-Projects | Agent library | Patterns only |
| LocalAI | Local provider | OpenAI-compatible adapter |
| FREE-LLM-API-Provider | Provider catalog | Data/reference |
| no-cost-ai | Provider catalog | Data/reference |
| free-llm-api-resources | Provider catalog | Data/reference |
| kit | Documentation/UI | Selective |
| developerFolio | Public site/UI | Selective |
| hugo-theme-academic-cv | Documentation | Optional |
| freebuff | Agent runtime | Architecture reference |

## Rules

1. Never edit source repositories during Nexron development.
2. Prefer APIs and adapters over copied source.
3. Record origin, license, version/commit and notices before copying source.
4. Keep runtimes isolated when needed.
5. Keep model providers replaceable.
