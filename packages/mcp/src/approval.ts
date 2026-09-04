import type { ToolRequest } from "@nexron/shared";

export interface ApprovalPolicy {
  isApproved(request: ToolRequest): boolean;
}

export class DefaultApprovalPolicy implements ApprovalPolicy {
  isApproved(request: ToolRequest): boolean {
    return request.approvalRequired === true;
  }
}
