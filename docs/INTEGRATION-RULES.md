# Integration Rules

Nexron integrates capabilities through stable interfaces. The source repositories remain independent.

## Integration order
1. Contracts and security boundaries
2. AI provider adapters
3. Agent/task runtime
4. MCP/tool registry
5. Memory
6. Lead intelligence
7. Browser worker
8. Execution worker
9. UI
10. Deployment

## Provenance
Before copying source, record repository, path, commit/tag, license, notices and modifications. Prefer adapters around external services when practical.

## Runtime boundaries
- TypeScript/Node: gateway, web UI, orchestration and provider adapters.
- Python: browser/execution/agent workers where upstream requires Python.
- Go: LocalAI remains an external model server.
- Android/Termux: development/control client; native desktop binaries are not required.

## Security
Tools have risk classifications. High-risk operations require explicit approval. Execution workers run in isolated workspaces.
