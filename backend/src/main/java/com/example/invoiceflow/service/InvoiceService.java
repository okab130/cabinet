package com.example.invoiceflow.service;

import com.example.invoiceflow.dto.InvoiceCreateRequest;
import com.example.invoiceflow.exception.ResourceNotFoundException;
import com.example.invoiceflow.model.ApprovalRequest;
import com.example.invoiceflow.model.ApprovalStep;
import com.example.invoiceflow.model.Invoice;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * 帳票サービス
 * 現実装: インメモリストレージ（デモ用）
 * 本番: Firestore への接続に切り替え
 */
@Service
public class InvoiceService {

    // デモ用インメモリストレージ
    private final List<Invoice> store = new CopyOnWriteArrayList<>();

    public InvoiceService() {
        // デモデータ初期化
        store.add(Invoice.builder()
                .id("inv001").type("send").docType("invoice")
                .invoiceNumber("INV-2024-001").partnerId("p001").partnerName("株式会社サンプル商事")
                .amount(100000).taxAmount(10000).totalAmount(110000)
                .issueDate("2024-11-01").dueDate("2024-11-30")
                .status("sent").description("2024年10月分 システム開発費")
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString()).createdBy("u001")
                .build());
        store.add(Invoice.builder()
                .id("inv002").type("receive").docType("invoice")
                .invoiceNumber("INV-R-2024-001").partnerId("p002").partnerName("テスト工業株式会社")
                .amount(50000).taxAmount(5000).totalAmount(55000)
                .issueDate("2024-11-05").dueDate("2024-12-05")
                .status("received").description("部品仕入れ費用")
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString()).createdBy("u002")
                .build());
    }

    /** 帳票一覧取得（クエリフィルタ対応） */
    public List<Invoice> findAll(String type, String status, String partnerId) {
        return store.stream()
                .filter(i -> type == null || i.getType().equals(type))
                .filter(i -> status == null || i.getStatus().equals(status))
                .filter(i -> partnerId == null || i.getPartnerId().equals(partnerId))
                .collect(Collectors.toList());
    }

    /** 帳票詳細取得 */
    public Invoice findById(String id) {
        return store.stream()
                .filter(i -> i.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("帳票が見つかりません: " + id));
    }

    /** 帳票新規作成 */
    public Invoice create(InvoiceCreateRequest req, String createdBy) {
        String taxRate = "0.10";
        long taxAmount = Math.round(req.getAmount() * Double.parseDouble(taxRate));

        Invoice invoice = Invoice.builder()
                .id(UUID.randomUUID().toString())
                .type("send")
                .docType(req.getDocType())
                .invoiceNumber(req.getInvoiceNumber() != null ? req.getInvoiceNumber()
                        : "INV-" + System.currentTimeMillis())
                .partnerId(req.getPartnerId())
                .amount(req.getAmount())
                .taxAmount(taxAmount)
                .totalAmount(req.getAmount() + taxAmount)
                .issueDate(req.getIssueDate())
                .dueDate(req.getDueDate())
                .status(req.getApproverIds() != null && !req.getApproverIds().isEmpty()
                        ? "pending_approval" : "sent")
                .description(req.getDescription())
                .createdAt(Instant.now().toString())
                .updatedAt(Instant.now().toString())
                .createdBy(createdBy)
                .build();

        store.add(invoice);
        return invoice;
    }

    /** 帳票更新 */
    public Invoice update(String id, Invoice updated) {
        Invoice existing = findById(id);
        updated.setId(existing.getId());
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(Instant.now().toString());
        store.replaceAll(i -> i.getId().equals(id) ? updated : i);
        return updated;
    }

    /** 電子押印 */
    public Invoice stamp(String id, String userId) {
        Invoice invoice = findById(id);
        invoice.setStampedAt(Instant.now().toString());
        invoice.setStampedBy(userId);
        invoice.setStatus("stamped");
        invoice.setUpdatedAt(Instant.now().toString());
        store.replaceAll(i -> i.getId().equals(id) ? invoice : i);
        return invoice;
    }

    /** 帳票削除（論理削除: status = cancelled） */
    public void delete(String id) {
        Invoice invoice = findById(id);
        invoice.setStatus("cancelled");
        invoice.setUpdatedAt(Instant.now().toString());
        store.replaceAll(i -> i.getId().equals(id) ? invoice : i);
    }
}
