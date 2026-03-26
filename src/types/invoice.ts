export type InvoiceStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'sent'
  | 'received'
  | 'confirmed'
  | 'rejected';

export type InvoiceType = 'send' | 'receive';

export type InvoiceDocType =
  | 'invoice'
  | 'delivery_note'
  | 'quotation'
  | 'purchase_order'
  | 'receipt';

export interface Invoice {
  id: string;
  type: InvoiceType;
  docType: InvoiceDocType;
  invoiceNumber: string;
  partnerId: string;
  partnerName: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  description: string;
  stampedAt?: string;
  stampedBy?: string;
  approvalRequestId?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
