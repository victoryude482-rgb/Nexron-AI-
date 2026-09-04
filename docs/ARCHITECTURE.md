# Nexron AI Architecture

## System

Web UI -> API Gateway -> AI Orchestrator -> persistence

The orchestrator contains:
- AI Router
- Agent Runtime
- Task Engine
- Tool Gateway
- Lead Intelligence
- Controlled Execution

## Adapter boundaries

- Model adapters: OpenAI-compatible APIs, Gemini, Groq, OpenRouter, GitHub Models, LocalAI and other providers.
- Agent adapter: Hermes-inspired tools, skills, sessions, subagents and memory.
- Browser adapter: Browser Use-compatible browser task execution.
- Execution adapter: controlled Open Interpreter-style execution.
- Lead adapter: LeadPilot discovery, normalization, deduplication, ranking and enrichment.
- MCP adapter: common tool discovery and invocation.
- GitHub adapter: repositories, files, issues and pull requests.

## AI routing

Select models using capability, health, latency, context requirements, limits, user preference and free/paid policy. Provider failure should trigger a compatible fallback.

## Agent lifecycle

request -> plan -> authorize -> execute -> observe -> revise -> review -> test -> result

Initial agents:
General, Researcher, Coder, Lead Finder, Trend Finder, Opportunity Finder, Reviewer, Tester.

## Security

All high-impact operations pass through a policy layer. Destructive shell operations require approval. Secrets are never exposed to an untrusted model. Arbitrary host execution is not directly available to agents.

## Lead intelligence

Discovery -> Normalize -> Deduplicate -> Enrich -> Score -> Store

## Deployment

Web/API, agent worker, browser worker, execution worker, lead worker, database, and optional local-model connectivity. Heavy inference/browser execution is not assumed to run on Android.

## Core entities

User, Project, Conversation, Message, AgentRun, Task, ToolCall, Model, Provider, Memory, Lead, Company, SearchRun, Approval.
