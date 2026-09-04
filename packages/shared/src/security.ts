export type Risk = "low" | "medium" | "high";

export function approvalRequired(risk: Risk): boolean {
  return risk === "high";
}

export function assertApproved(risk: Risk, approved: boolean): void {
  if (approvalRequired(risk) && !approved) throw new Error("Explicit approval is required for this operation.");
}