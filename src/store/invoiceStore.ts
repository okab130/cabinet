import { create } from 'zustand';
import { Invoice } from '../types/invoice';
import { ApprovalRequest } from '../types/approval';
import { Partner } from '../types/partner';
import { mockInvoices, mockApprovalRequests, mockPartners } from '../data/mockData';
import { isFirebaseConfigured } from '../lib/firebase';
import * as fs from '../lib/firestoreService';

interface InvoiceState {
  invoices: Invoice[];
  approvals: ApprovalRequest[];
  partners: Partner[];
  loading: boolean;

  /** Firestore リアルタイムリスナーを開始する。返り値は unsubscribe 関数 */
  initializeListeners: () => () => void;

  stampInvoice: (id: string, userId: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  addInvoice: (inv: Invoice) => Promise<void>;

  approveStep: (approvalId: string, comment: string) => Promise<void>;
  rejectStep: (approvalId: string, comment: string) => Promise<void>;

  addPartner: (p: Omit<Partner, 'id'>) => Promise<void>;
  updatePartner: (p: Partner) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [...mockInvoices],
  approvals: [...mockApprovalRequests],
  partners: [...mockPartners],
  loading: false,

  // ── Firestore リアルタイムリスナー ──────────────────────────────────────────
  initializeListeners: () => {
    if (!isFirebaseConfigured) return () => {};

    set({ loading: true });

    const unsubInvoices = fs.subscribeInvoices({}, (invoices) =>
      set({ invoices, loading: false })
    );
    const unsubApprovals = fs.subscribeApprovals(undefined, (approvals) =>
      set({ approvals })
    );
    const unsubPartners = fs.subscribePartners((partners) =>
      set({ partners })
    );

    return () => {
      unsubInvoices();
      unsubApprovals();
      unsubPartners();
    };
  },

  // ── Invoice actions ────────────────────────────────────────────────────────

  stampInvoice: async (id, userId) => {
    if (isFirebaseConfigured) {
      await fs.stampInvoice(id, userId);
    } else {
      set((state) => ({
        invoices: state.invoices.map((inv) =>
          inv.id === id
            ? {
                ...inv,
                stampedAt: new Date().toISOString(),
                stampedBy: userId,
                status: 'confirmed' as Invoice['status'],
                updatedAt: new Date().toISOString(),
              }
            : inv
        ),
      }));
    }
  },

  updateInvoiceStatus: async (id, status) => {
    if (isFirebaseConfigured) {
      await fs.updateInvoice(id, { status });
    } else {
      set((state) => ({
        invoices: state.invoices.map((inv) =>
          inv.id === id ? { ...inv, status, updatedAt: new Date().toISOString() } : inv
        ),
      }));
    }
  },

  addInvoice: async (inv) => {
    if (isFirebaseConfigured) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...data } = inv;
      await fs.createInvoice(data);
    } else {
      set((state) => ({ invoices: [inv, ...state.invoices] }));
    }
  },

  // ── Approval actions ───────────────────────────────────────────────────────

  approveStep: async (approvalId, comment) => {
    const approval = get().approvals.find((a) => a.id === approvalId);
    if (!approval) return;

    const steps = approval.steps.map((s) =>
      s.stepIndex === approval.currentStepIndex
        ? { ...s, status: 'approved' as const, comment, actedAt: new Date().toISOString() }
        : s
    );
    const nextIndex = approval.currentStepIndex + 1;
    const isLast = nextIndex >= approval.steps.length;
    const updated: Partial<ApprovalRequest> = {
      steps,
      currentStepIndex: isLast ? approval.currentStepIndex : nextIndex,
      status: isLast ? ('approved' as const) : ('pending' as const),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured) {
      await fs.updateApproval(approvalId, updated);
    } else {
      set((state) => ({
        approvals: state.approvals.map((a) =>
          a.id === approvalId ? { ...a, ...updated } : a
        ),
      }));
    }
  },

  rejectStep: async (approvalId, comment) => {
    const approval = get().approvals.find((a) => a.id === approvalId);
    if (!approval) return;

    const steps = approval.steps.map((s) =>
      s.stepIndex === approval.currentStepIndex
        ? { ...s, status: 'rejected' as const, comment, actedAt: new Date().toISOString() }
        : s
    );
    const updated: Partial<ApprovalRequest> = {
      steps,
      status: 'rejected' as const,
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured) {
      await fs.updateApproval(approvalId, updated);
    } else {
      set((state) => ({
        approvals: state.approvals.map((a) =>
          a.id === approvalId ? { ...a, ...updated } : a
        ),
      }));
    }
  },

  // ── Partner actions ────────────────────────────────────────────────────────

  addPartner: async (p) => {
    if (isFirebaseConfigured) {
      await fs.createPartner(p);
    } else {
      const partner: Partner = { ...p, id: `p-${Date.now()}` };
      set((state) => ({ partners: [partner, ...state.partners] }));
    }
  },

  updatePartner: async (p) => {
    if (isFirebaseConfigured) {
      const { id, ...data } = p;
      await fs.updatePartner(id, data);
    } else {
      set((state) => ({ partners: state.partners.map((x) => (x.id === p.id ? p : x)) }));
    }
  },

  deletePartner: async (id) => {
    if (isFirebaseConfigured) {
      await fs.deletePartner(id);
    } else {
      set((state) => ({ partners: state.partners.filter((x) => x.id !== id) }));
    }
  },
}));


