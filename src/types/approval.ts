export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';
export type StepStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalStep {
  stepIndex: number;
  approverName: string;
  approverId: string;
  status: StepStatus;
  comment?: string;
  actedAt?: string;
}

export interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  type: string;
  status: ApprovalStatus;
  requesterId: string;
  requesterName: string;
  currentStepIndex: number;
  steps: ApprovalStep[];
  relatedInvoiceId?: string;
  createdAt: string;
  updatedAt: string;
}
