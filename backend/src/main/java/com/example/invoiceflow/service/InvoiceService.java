package com.example.invoiceflow.service;

import com.example.invoiceflow.dto.InvoiceCreateRequest;
import com.example.invoiceflow.exception.ResourceNotFoundException;
import com.example.invoiceflow.model.Invoice;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * 帳票サービス
 * Firestore が利用可能な場合は Firestore を使用し、
 * 未設定の場合はインメモリストレージにフォールバックする。
 */
@Service
public class InvoiceService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceService.class);
    private static final String COLLECTION = "invoices";

    @Autowired(required = false)
    private Firestore firestore;

    /** フォールバック用インメモリストレージ */
    private final List<Invoice> memStore = new CopyOnWriteArrayList<>();

    public InvoiceService() {
        memStore.add(Invoice.builder()
                .id("inv001").type("send").docType("invoice")
                .invoiceNumber("INV-2024-001").partnerId("p001").partnerName("株式会社サンプル商事")
                .amount(100000).taxAmount(10000).totalAmount(110000)
                .issueDate("2024-11-01").dueDate("2024-11-30")
                .status("sent").description("2024年10月分 システム開発費")
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString()).createdBy("u001")
                .build());
        memStore.add(Invoice.builder()
                .id("inv002").type("receive").docType("invoice")
                .invoiceNumber("INV-R-2024-001").partnerId("p002").partnerName("テスト工業株式会社")
                .amount(50000).taxAmount(5000).totalAmount(55000)
                .issueDate("2024-11-05").dueDate("2024-12-05")
                .status("received").description("部品仕入れ費用")
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString()).createdBy("u002")
                .build());
    }

    private boolean useFirestore() {
        return firestore != null;
    }

    // ── Firestore ヘルパー ────────────────────────────────────────────────────

    private Invoice docToInvoice(QueryDocumentSnapshot doc) {
        Invoice inv = doc.toObject(Invoice.class);
        inv.setId(doc.getId());
        return inv;
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public List<Invoice> findAll(String type, String status, String partnerId) {
        if (useFirestore()) {
            try {
                var ref = firestore.collection(COLLECTION);
                var query = ref.orderBy("createdAt", com.google.cloud.firestore.Query.Direction.DESCENDING);
                if (type != null) query = query.whereEqualTo("type", type);
                if (status != null) query = query.whereEqualTo("status", status);
                if (partnerId != null) query = query.whereEqualTo("partnerId", partnerId);
                return query.get().get().getDocuments().stream()
                        .map(this::docToInvoice).collect(Collectors.toList());
            } catch (Exception e) {
                log.error("[Firestore] findAll error: {}", e.getMessage());
                throw new RuntimeException("帳票一覧の取得に失敗しました", e);
            }
        }
        return memStore.stream()
                .filter(i -> type == null || i.getType().equals(type))
                .filter(i -> status == null || i.getStatus().equals(status))
                .filter(i -> partnerId == null || i.getPartnerId().equals(partnerId))
                .collect(Collectors.toList());
    }

    public Invoice findById(String id) {
        if (useFirestore()) {
            try {
                var doc = firestore.collection(COLLECTION).document(id).get().get();
                if (!doc.exists()) throw new ResourceNotFoundException("帳票が見つかりません: " + id);
                Invoice inv = doc.toObject(Invoice.class);
                assert inv != null;
                inv.setId(doc.getId());
                return inv;
            } catch (ResourceNotFoundException e) {
                throw e;
            } catch (Exception e) {
                log.error("[Firestore] findById error: {}", e.getMessage());
                throw new RuntimeException("帳票の取得に失敗しました", e);
            }
        }
        return memStore.stream().filter(i -> i.getId().equals(id)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("帳票が見つかりません: " + id));
    }

    public Invoice create(InvoiceCreateRequest req, String createdBy) {
        long taxAmount = Math.round(req.getAmount() * 0.10);
        String id = UUID.randomUUID().toString();
        Invoice invoice = Invoice.builder()
                .id(id).type("send").docType(req.getDocType())
                .invoiceNumber(req.getInvoiceNumber() != null ? req.getInvoiceNumber() : "INV-" + System.currentTimeMillis())
                .partnerId(req.getPartnerId()).amount(req.getAmount())
                .taxAmount(taxAmount).totalAmount(req.getAmount() + taxAmount)
                .issueDate(req.getIssueDate()).dueDate(req.getDueDate())
                .status(req.getApproverIds() != null && !req.getApproverIds().isEmpty() ? "pending_approval" : "sent")
                .description(req.getDescription())
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString()).createdBy(createdBy)
                .build();

        if (useFirestore()) {
            try {
                firestore.collection(COLLECTION).document(id).set(toMap(invoice)).get();
            } catch (Exception e) {
                log.error("[Firestore] create error: {}", e.getMessage());
                throw new RuntimeException("帳票の作成に失敗しました", e);
            }
        } else {
            memStore.add(invoice);
        }
        return invoice;
    }

    public Invoice update(String id, Invoice updated) {
        Invoice existing = findById(id);
        updated.setId(existing.getId());
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(Instant.now().toString());

        if (useFirestore()) {
            try {
                firestore.collection(COLLECTION).document(id).set(toMap(updated)).get();
            } catch (Exception e) {
                log.error("[Firestore] update error: {}", e.getMessage());
                throw new RuntimeException("帳票の更新に失敗しました", e);
            }
        } else {
            memStore.replaceAll(i -> i.getId().equals(id) ? updated : i);
        }
        return updated;
    }

    public Invoice stamp(String id, String userId) {
        Invoice invoice = findById(id);
        invoice.setStampedAt(Instant.now().toString());
        invoice.setStampedBy(userId);
        invoice.setStatus("stamped");
        invoice.setUpdatedAt(Instant.now().toString());

        if (useFirestore()) {
            try {
                Map<String, Object> updates = new HashMap<>();
                updates.put("stampedAt", invoice.getStampedAt());
                updates.put("stampedBy", invoice.getStampedBy());
                updates.put("status", "stamped");
                updates.put("updatedAt", invoice.getUpdatedAt());
                firestore.collection(COLLECTION).document(id).update(updates).get();
            } catch (Exception e) {
                log.error("[Firestore] stamp error: {}", e.getMessage());
                throw new RuntimeException("電子押印に失敗しました", e);
            }
        } else {
            memStore.replaceAll(i -> i.getId().equals(id) ? invoice : i);
        }
        return invoice;
    }

    public void delete(String id) {
        if (useFirestore()) {
            try {
                Map<String, Object> updates = new HashMap<>();
                updates.put("status", "cancelled");
                updates.put("updatedAt", Instant.now().toString());
                firestore.collection(COLLECTION).document(id).update(updates).get();
            } catch (Exception e) {
                log.error("[Firestore] delete error: {}", e.getMessage());
                throw new RuntimeException("帳票の削除に失敗しました", e);
            }
        } else {
            Invoice invoice = findById(id);
            invoice.setStatus("cancelled");
            invoice.setUpdatedAt(Instant.now().toString());
            memStore.replaceAll(i -> i.getId().equals(id) ? invoice : i);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> toMap(Invoice inv) {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        return mapper.convertValue(inv, Map.class);
    }
}
