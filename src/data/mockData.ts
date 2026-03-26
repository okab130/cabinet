import { User } from '../types/user';
import { Invoice } from '../types/invoice';
import { ApprovalRequest } from '../types/approval';
import { Partner } from '../types/partner';
import { FolderNode } from '../types/folder';

export const mockUsers: User[] = [
  { id: 'u001', displayName: '管理者 太郎', email: 'admin@example.com', role: 'admin', department: '情報システム部', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'u002', displayName: '経理 花子', email: 'hanako@example.com', role: 'manager', department: '経理部', createdAt: '2024-01-05T00:00:00Z', updatedAt: '2024-01-05T00:00:00Z' },
  { id: 'u003', displayName: '営業 次郎', email: 'jiro@example.com', role: 'user', department: '営業部', createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-01-10T00:00:00Z' },
  { id: 'u004', displayName: '部長 三郎', email: 'saburo@example.com', role: 'manager', department: '経理部', createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
];

export const mockPartners: Partner[] = [
  { id: 'p001', name: '株式会社サンプル商事', nameKana: 'カブシキガイシャサンプルショウジ', code: 'P001', email: 'info@sample-shoji.co.jp', phone: '03-1234-5678', address: '東京都千代田区丸の内1-1-1', zipCode: '100-0005', contactPerson: '鈴木 一郎', invoiceRegistrationNumber: 'T1234567890123', isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'p002', name: '有限会社テスト工業', nameKana: 'ユウゲンガイシャテストコウギョウ', code: 'P002', email: 'contact@test-kogyo.co.jp', phone: '06-2345-6789', address: '大阪府大阪市北区梅田2-2-2', zipCode: '530-0001', contactPerson: '田中 二郎', invoiceRegistrationNumber: 'T9876543210987', isActive: true, createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' },
  { id: 'p003', name: '合同会社デモシステム', nameKana: 'ゴウドウガイシャデモシステム', code: 'P003', email: 'hello@demo-system.co.jp', phone: '052-3456-7890', address: '愛知県名古屋市中区栄3-3-3', zipCode: '460-0008', contactPerson: '伊藤 三郎', invoiceRegistrationNumber: 'T1111222233334', isActive: false, createdAt: '2024-01-03T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z' },
  { id: 'p004', name: '株式会社ABCコーポレーション', nameKana: 'カブシキガイシャエービーシーコーポレーション', code: 'P004', email: 'abc@abc-corp.co.jp', phone: '011-4567-8901', address: '北海道札幌市中央区北1条西4-4-4', zipCode: '060-0001', contactPerson: '山田 四郎', invoiceRegistrationNumber: 'T5555666677778', isActive: true, createdAt: '2024-01-04T00:00:00Z', updatedAt: '2024-01-04T00:00:00Z' },
  { id: 'p005', name: '株式会社エクサンプル', nameKana: 'カブシキガイシャエクサンプル', code: 'P005', email: 'info@example-corp.jp', phone: '092-5678-9012', address: '福岡県福岡市博多区博多駅前5-5-5', zipCode: '812-0011', contactPerson: '中村 五郎', invoiceRegistrationNumber: 'T9999888877776', isActive: true, createdAt: '2024-01-05T00:00:00Z', updatedAt: '2024-01-05T00:00:00Z' },
];

export const mockInvoices: Invoice[] = [
  { id: 'inv001', type: 'send', docType: 'invoice', invoiceNumber: 'INV-2024-001', partnerId: 'p001', partnerName: '株式会社サンプル商事', amount: 100000, taxAmount: 10000, totalAmount: 110000, issueDate: '2024-01-31', dueDate: '2024-02-29', status: 'sent', description: '1月分システム利用料', createdAt: '2024-01-31T09:00:00Z', updatedAt: '2024-01-31T10:00:00Z', createdBy: 'u002' },
  { id: 'inv002', type: 'send', docType: 'invoice', invoiceNumber: 'INV-2024-002', partnerId: 'p002', partnerName: '有限会社テスト工業', amount: 250000, taxAmount: 25000, totalAmount: 275000, issueDate: '2024-01-31', dueDate: '2024-02-29', status: 'pending_approval', description: '1月分コンサルティング料', createdAt: '2024-01-31T10:00:00Z', updatedAt: '2024-01-31T10:00:00Z', createdBy: 'u003', approvalRequestId: 'apr001' },
  { id: 'inv003', type: 'send', docType: 'delivery_note', invoiceNumber: 'DN-2024-001', partnerId: 'p001', partnerName: '株式会社サンプル商事', amount: 50000, taxAmount: 5000, totalAmount: 55000, issueDate: '2024-01-15', dueDate: '2024-01-31', status: 'confirmed', description: '1月分納品書', createdAt: '2024-01-15T09:00:00Z', updatedAt: '2024-01-20T10:00:00Z', createdBy: 'u002' },
  { id: 'inv004', type: 'receive', docType: 'invoice', invoiceNumber: 'RCV-2024-001', partnerId: 'p003', partnerName: '合同会社デモシステム', amount: 80000, taxAmount: 8000, totalAmount: 88000, issueDate: '2024-01-25', dueDate: '2024-02-25', status: 'received', description: 'ソフトウェア開発費', createdAt: '2024-01-25T11:00:00Z', updatedAt: '2024-01-25T11:00:00Z', createdBy: 'u001' },
  { id: 'inv005', type: 'receive', docType: 'invoice', invoiceNumber: 'RCV-2024-002', partnerId: 'p004', partnerName: '株式会社ABCコーポレーション', amount: 150000, taxAmount: 15000, totalAmount: 165000, issueDate: '2024-01-28', dueDate: '2024-02-28', status: 'confirmed', description: '設備リース料', stampedAt: '2024-01-30T14:00:00Z', stampedBy: 'u002', createdAt: '2024-01-28T09:00:00Z', updatedAt: '2024-01-30T14:00:00Z', createdBy: 'u001' },
  { id: 'inv006', type: 'receive', docType: 'purchase_order', invoiceNumber: 'PO-2024-001', partnerId: 'p005', partnerName: '株式会社エクサンプル', amount: 320000, taxAmount: 32000, totalAmount: 352000, issueDate: '2024-02-01', dueDate: '2024-02-29', status: 'pending_approval', description: '資材購入費', createdAt: '2024-02-01T09:00:00Z', updatedAt: '2024-02-01T09:00:00Z', createdBy: 'u001', approvalRequestId: 'apr002' },
  { id: 'inv007', type: 'send', docType: 'invoice', invoiceNumber: 'INV-2024-003', partnerId: 'p004', partnerName: '株式会社ABCコーポレーション', amount: 180000, taxAmount: 18000, totalAmount: 198000, issueDate: '2024-02-29', dueDate: '2024-03-31', status: 'draft', description: '2月分保守料', createdAt: '2024-02-28T09:00:00Z', updatedAt: '2024-02-28T09:00:00Z', createdBy: 'u002' },
  { id: 'inv008', type: 'receive', docType: 'invoice', invoiceNumber: 'RCV-2024-003', partnerId: 'p001', partnerName: '株式会社サンプル商事', amount: 60000, taxAmount: 6000, totalAmount: 66000, issueDate: '2024-02-28', dueDate: '2024-03-31', status: 'received', description: '外部研修費', createdAt: '2024-02-28T10:00:00Z', updatedAt: '2024-02-28T10:00:00Z', createdBy: 'u001' },
];

export const mockApprovalRequests: ApprovalRequest[] = [
  {
    id: 'apr001', title: '請求書送信承認依頼 - INV-2024-002',
    description: '有限会社テスト工業向け1月分コンサルティング料 ¥275,000の送信承認をお願いします。',
    type: 'invoice_send', status: 'pending', requesterId: 'u003', requesterName: '営業 次郎',
    currentStepIndex: 0,
    steps: [
      { stepIndex: 0, approverName: '経理 花子', approverId: 'u002', status: 'pending' },
      { stepIndex: 1, approverName: '部長 三郎', approverId: 'u004', status: 'pending' },
    ],
    relatedInvoiceId: 'inv002', createdAt: '2024-01-31T10:30:00Z', updatedAt: '2024-01-31T10:30:00Z',
  },
  {
    id: 'apr002', title: '受信帳票承認依頼 - PO-2024-001',
    description: '株式会社エクサンプルからの資材購入費 ¥352,000の受領確認承認をお願いします。',
    type: 'invoice_receive', status: 'pending', requesterId: 'u001', requesterName: '管理者 太郎',
    currentStepIndex: 1,
    steps: [
      { stepIndex: 0, approverName: '経理 花子', approverId: 'u002', status: 'approved', comment: '金額確認済み。問題ありません。', actedAt: '2024-02-01T11:00:00Z' },
      { stepIndex: 1, approverName: '部長 三郎', approverId: 'u004', status: 'pending' },
    ],
    relatedInvoiceId: 'inv006', createdAt: '2024-02-01T09:30:00Z', updatedAt: '2024-02-01T11:00:00Z',
  },
  {
    id: 'apr003', title: '請求書送信承認 - INV-2024-001',
    description: '株式会社サンプル商事向け1月分システム利用料の送信承認（完了）',
    type: 'invoice_send', status: 'approved', requesterId: 'u002', requesterName: '経理 花子',
    currentStepIndex: 1,
    steps: [
      { stepIndex: 0, approverName: '経理 花子', approverId: 'u002', status: 'approved', comment: '確認しました。', actedAt: '2024-01-30T10:00:00Z' },
      { stepIndex: 1, approverName: '部長 三郎', approverId: 'u004', status: 'approved', comment: '承認します。', actedAt: '2024-01-30T15:00:00Z' },
    ],
    relatedInvoiceId: 'inv001', createdAt: '2024-01-29T09:00:00Z', updatedAt: '2024-01-30T15:00:00Z',
  },
];

export const mockFolderTree: FolderNode[] = [
  {
    id: 'f001', name: '取引文書', isFolder: true, children: [
      {
        id: 'f002', name: '2024年', isFolder: true, children: [
          {
            id: 'f003', name: '1月', isFolder: true, children: [
              { id: 'file001', name: 'INV-2024-001.pdf', isFolder: false, size: 124800, mimeType: 'application/pdf', updatedAt: '2024-01-31T10:00:00Z' },
              { id: 'file002', name: 'RCV-2024-001.pdf', isFolder: false, size: 98304, mimeType: 'application/pdf', updatedAt: '2024-01-25T11:00:00Z' },
            ],
          },
          {
            id: 'f004', name: '2月', isFolder: true, children: [
              { id: 'file003', name: 'INV-2024-003_draft.pdf', isFolder: false, size: 115200, mimeType: 'application/pdf', updatedAt: '2024-02-28T09:00:00Z' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'f010', name: '取引先別', isFolder: true, children: [
      { id: 'f011', name: '株式会社サンプル商事', isFolder: true, children: [] },
      { id: 'f012', name: '有限会社テスト工業', isFolder: true, children: [] },
    ],
  },
  {
    id: 'f020', name: 'テンプレート', isFolder: true, children: [
      { id: 'file010', name: '請求書テンプレート.xlsx', isFolder: false, size: 20480, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', updatedAt: '2024-01-01T00:00:00Z' },
      { id: 'file011', name: '納品書テンプレート.xlsx', isFolder: false, size: 18432, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', updatedAt: '2024-01-01T00:00:00Z' },
    ],
  },
];

export const dashboardKpi = { sendThisMonth: 3, receiveThisMonth: 3, pendingApproval: 2, completedThisMonth: 5 };

export const monthlyData = [
  { month: '10月', send: 8, receive: 12 },
  { month: '11月', send: 11, receive: 9 },
  { month: '12月', send: 14, receive: 11 },
  { month: '1月', send: 7, receive: 8 },
  { month: '2月', send: 3, receive: 3 },
];

export const statusData = [
  { name: '送信済み', value: 4, color: '#2196f3' },
  { name: '受信確認済', value: 3, color: '#4caf50' },
  { name: '承認待ち', value: 2, color: '#ff9800' },
  { name: 'ドラフト', value: 1, color: '#9e9e9e' },
];
