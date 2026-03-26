import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice } from '../../types/invoice';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  section: { marginBottom: 16 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 120, color: '#666' },
  value: { flex: 1 },
  divider: { borderBottom: '1pt solid #ccc', marginVertical: 12 },
  table: { border: '1pt solid #ddd', marginTop: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f5f5f5', padding: 6, borderBottom: '1pt solid #ddd' },
  tableRow: { flexDirection: 'row', padding: 6, borderBottom: '0.5pt solid #eee' },
  tableCell: { flex: 1 },
  totalRow: { flexDirection: 'row', padding: 6, backgroundColor: '#e3f2fd' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#999', fontSize: 8 },
});

const docTypeLabel: Record<string, string> = {
  invoice: '請 求 書', delivery_note: '納 品 書', quotation: '見 積 書',
  purchase_order: '発 注 書', receipt: '領 収 書',
};

interface Props { invoice: Invoice }

const InvoicePdfDocument: React.FC<Props> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{docTypeLabel[invoice.docType] ?? '帳 票'}</Text>

      <View style={styles.section}>
        <View style={styles.row}><Text style={styles.label}>帳票番号:</Text><Text style={styles.value}>{invoice.invoiceNumber}</Text></View>
        <View style={styles.row}><Text style={styles.label}>発行日:</Text><Text style={styles.value}>{invoice.issueDate}</Text></View>
        <View style={styles.row}><Text style={styles.label}>支払期限:</Text><Text style={styles.value}>{invoice.dueDate}</Text></View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.row}><Text style={styles.label}>取引先:</Text><Text style={styles.value}>{invoice.partnerName}</Text></View>
        <View style={styles.row}><Text style={styles.label}>件名:</Text><Text style={styles.value}>{invoice.description}</Text></View>
      </View>

      <View style={styles.divider} />

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, { flex: 3 }]}>摘要</Text>
          <Text style={styles.tableCell}>金額</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 3 }]}>{invoice.description}</Text>
          <Text style={styles.tableCell}>{invoice.amount.toLocaleString()} 円</Text>
        </View>
        <View style={[styles.tableRow, { backgroundColor: '#fafafa' }]}>
          <Text style={[styles.tableCell, { flex: 3 }]}>消費税(10%)</Text>
          <Text style={styles.tableCell}>{invoice.taxAmount.toLocaleString()} 円</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.tableCell, { flex: 3, fontWeight: 'bold' }]}>合計</Text>
          <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{invoice.totalAmount.toLocaleString()} 円</Text>
        </View>
      </View>

      {invoice.stampedAt && (
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={{ color: '#1565C0' }}>✓ 電子押印済み: {new Date(invoice.stampedAt).toLocaleString('ja-JP')}</Text>
        </View>
      )}

      <Text style={styles.footer}>
        InvoiceFlow - 電子取引管理システム | 出力日時: {new Date().toLocaleString('ja-JP')}
      </Text>
    </Page>
  </Document>
);

export default InvoicePdfDocument;
