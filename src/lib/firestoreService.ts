/**
 * Firestore サービス層
 * isFirebaseConfigured が false の場合は呼び出さないこと（invoiceStore・authStore 側でガード済み）
 */
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Unsubscribe,
  QueryConstraint,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Invoice } from '../types/invoice';
import { ApprovalRequest } from '../types/approval';
import { Partner } from '../types/partner';
import { User } from '../types/user';

// ─── Invoices ────────────────────────────────────────────────────────────────

export const subscribeInvoices = (
  filters: { type?: string; status?: string },
  callback: (invoices: Invoice[]) => void
): Unsubscribe => {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (filters.type) constraints.push(where('type', '==', filters.type));
  if (filters.status) constraints.push(where('status', '==', filters.status));

  const q = query(collection(db, 'invoices'), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Invoice)));
  });
};

export const createInvoice = async (data: Omit<Invoice, 'id'>): Promise<Invoice> => {
  const ref = await addDoc(collection(db, 'invoices'), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return { id: ref.id, ...data };
};

export const updateInvoice = async (id: string, data: Partial<Invoice>): Promise<void> => {
  await updateDoc(doc(db, 'invoices', id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const stampInvoice = async (id: string, userId: string): Promise<void> => {
  await updateDoc(doc(db, 'invoices', id), {
    stampedAt: new Date().toISOString(),
    stampedBy: userId,
    status: 'stamped',
    updatedAt: new Date().toISOString(),
  });
};

// ─── Approvals ───────────────────────────────────────────────────────────────

export const subscribeApprovals = (
  status: string | undefined,
  callback: (approvals: ApprovalRequest[]) => void
): Unsubscribe => {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (status) constraints.push(where('status', '==', status));

  const q = query(collection(db, 'approvals'), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ApprovalRequest)));
  });
};

export const createApproval = async (data: Omit<ApprovalRequest, 'id'>): Promise<ApprovalRequest> => {
  const ref = await addDoc(collection(db, 'approvals'), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return { id: ref.id, ...data };
};

export const updateApproval = async (
  id: string,
  data: Partial<ApprovalRequest>
): Promise<void> => {
  await updateDoc(doc(db, 'approvals', id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

// ─── Partners ────────────────────────────────────────────────────────────────

export const subscribePartners = (
  callback: (partners: Partner[]) => void
): Unsubscribe => {
  const q = query(collection(db, 'partners'), orderBy('name', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Partner)));
  });
};

export const createPartner = async (data: Omit<Partner, 'id'>): Promise<Partner> => {
  const ref = await addDoc(collection(db, 'partners'), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return { id: ref.id, ...data };
};

export const updatePartner = async (id: string, data: Partial<Partner>): Promise<void> => {
  await updateDoc(doc(db, 'partners', id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deletePartner = async (id: string): Promise<void> => {
  // 論理削除（isActive = false）
  await updateDoc(doc(db, 'partners', id), {
    isActive: false,
    updatedAt: new Date().toISOString(),
  });
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const getUser = async (uid: string): Promise<User | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? ({ id: uid, ...snap.data() } as User) : null;
};

export const upsertUser = async (uid: string, data: Partial<User>): Promise<void> => {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
};
