export class NexronError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "NexronError";
  }
}

export class ProviderError extends NexronError {
  constructor(message: string, cause?: unknown) {
    super(message, "PROVIDER_ERROR", cause);
    this.name = "ProviderError";
  }
}

export class ApprovalRequiredError extends NexronError {
  constructor(tool: string) {
    super(`Approval required for high-risk tool: ${tool}`, "APPROVAL_REQUIRED");
    this.name = "ApprovalRequiredError";
  }
}
