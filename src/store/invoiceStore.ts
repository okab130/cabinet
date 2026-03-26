import { create } from 'zustand';
import { Invoice } from '../types/invoice';
import { ApprovalRequest } from '../types/approval';
import { Partner } from '../types/partner';
import { mockInvoices, mockApprovalRequests, mockPartners } from '../data/mockData';

interface InvoiceState {
  invoices: Invoice[];
  approvals: ApprovalRequest[];
  partners: Partner[];
  stampInvoice: (id: string, userId: string) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  addInvoice: (inv: Invoice) => void;
  approveStep: (approvalId: string, comment: string) => void;
  rejectStep: (approvalId: string, comment: string) => void;
  addPartner: (p: Partner) => void;
  updatePartner: (p: Partner) => void;
  deletePartner: (id: string) => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [...mockInvoices],
  approvals: [...mockApprovalRequests],
  partners: [...mockPartners],

  stampInvoice: (id, userId) =>
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id
          ? { ...inv, stampedAt: new Date().toISOString(), stampedBy: userId, status: 'confirmed', updatedAt: new Date().toISOString() }
          : inv
      ),
    })),

  updateInvoiceStatus: (id, status) =>
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id ? { ...inv, status, updatedAt: new Date().toISOString() } : inv
      ),
    })),

  addInvoice: (inv) =>
    set((state) => ({ invoices: [inv, ...state.invoices] })),

  approveStep: (approvalId, comment) =>
    set((state) => ({
      approvals: state.approvals.map((apr) => {
        if (apr.id !== approvalId) return apr;
        const steps = apr.steps.map((s) =>
          s.stepIndex === apr.currentStepIndex
            ? { ...s, status: 'approved' as const, comment, actedAt: new Date().toISOString() }
            : s
        );
        const nextIndex = apr.currentStepIndex + 1;
        const isLast = nextIndex >= apr.steps.length;
        return { ...apr, steps, currentStepIndex: isLast ? apr.currentStepIndex : nextIndex, status: isLast ? 'approved' as const : 'pending' as const, updatedAt: new Date().toISOString() };
      }),
    })),

  rejectStep: (approvalId, comment) =>
    set((state) => ({
      approvals: state.approvals.map((apr) => {
        if (apr.id !== approvalId) return apr;
        const steps = apr.steps.map((s) =>
          s.stepIndex === apr.currentStepIndex
            ? { ...s, status: 'rejected' as const, comment, actedAt: new Date().toISOString() }
            : s
        );
        return { ...apr, steps, status: 'rejected' as const, updatedAt: new Date().toISOString() };
      }),
    })),

  addPartner: (p) => set((state) => ({ partners: [p, ...state.partners] })),
  updatePartner: (p) =>
    set((state) => ({ partners: state.partners.map((x) => (x.id === p.id ? p : x)) })),
  deletePartner: (id) =>
    set((state) => ({ partners: state.partners.filter((x) => x.id !== id) })),
}));
