package com.example.invoiceflow.service;

import com.example.invoiceflow.exception.ForbiddenException;
import com.example.invoiceflow.exception.ResourceNotFoundException;
import com.example.invoiceflow.model.ApprovalRequest;
import com.example.invoiceflow.model.ApprovalStep;
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
 * 承認フローサービス
 * Firestore が利用可能な場合は Firestore を使用し、
 * 未設定の場合はインメモリストレージにフォールバックする。
 */
@Service
public class ApprovalService {

    private static final Logger log = LoggerFactory.getLogger(ApprovalService.class);
    private static final String COLLECTION = "approvals";

    @Autowired(required = false)
    private Firestore firestore;

    private final List<ApprovalRequest> memStore = new CopyOnWriteArrayList<>();

    public ApprovalService() {
        ApprovalStep step1 = ApprovalStep.builder()
                .stepIndex(0).approverId("u002").approverName("田中 花子")
                .status("approved").comment("確認しました").actedAt(Instant.now().toString())
                .build();
        ApprovalStep step2 = ApprovalStep.builder()
                .stepIndex(1).approverId("u003").approverName("鈴木 太郎")
                .status("pending").build();

        memStore.add(ApprovalRequest.builder()
                .id("apr001").type("invoice_send").invoiceId("inv001")
                .title("2024年10月分 システム開発費 送信承認申請")
                .description("株式会社サンプル商事への請求書送信の承認をお願いします")
                .requesterId("u001").requesterName("管理者")
                .currentStepIndex(1).steps(List.of(step1, step2))
                .status("pending")
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString())
                .build());
    }

    private boolean useFirestore() { return firestore != null; }

    private ApprovalRequest docToApproval(QueryDocumentSnapshot doc) {
        ApprovalRequest apr = doc.toObject(ApprovalRequest.class);
        apr.setId(doc.getId());
        return apr;
    }

    public List<ApprovalRequest> findAll(String status) {
        if (useFirestore()) {
            try {
                var query = firestore.collection(COLLECTION)
                        .orderBy("createdAt", com.google.cloud.firestore.Query.Direction.DESCENDING);
                if (status != null) query = query.whereEqualTo("status", status);
                return query.get().get().getDocuments().stream()
                        .map(this::docToApproval).collect(Collectors.toList());
            } catch (Exception e) {
                log.error("[Firestore] findAll error: {}", e.getMessage());
                throw new RuntimeException("承認申請一覧の取得に失敗しました", e);
            }
        }
        return memStore.stream()
                .filter(a -> status == null || a.getStatus().equals(status))
                .collect(Collectors.toList());
    }

    public ApprovalRequest findById(String id) {
        if (useFirestore()) {
            try {
                var doc = firestore.collection(COLLECTION).document(id).get().get();
                if (!doc.exists()) throw new ResourceNotFoundException("承認申請が見つかりません: " + id);
                ApprovalRequest apr = doc.toObject(ApprovalRequest.class);
                assert apr != null;
                apr.setId(doc.getId());
                return apr;
            } catch (ResourceNotFoundException e) {
                throw e;
            } catch (Exception e) {
                log.error("[Firestore] findById error: {}", e.getMessage());
                throw new RuntimeException("承認申請の取得に失敗しました", e);
            }
        }
        return memStore.stream().filter(a -> a.getId().equals(id)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("承認申請が見つかりません: " + id));
    }

    public ApprovalRequest create(ApprovalRequest request) {
        String id = UUID.randomUUID().toString();
        request.setId(id);
        request.setStatus("pending");
        request.setCurrentStepIndex(0);
        request.setCreatedAt(Instant.now().toString());
        request.setUpdatedAt(Instant.now().toString());

        if (useFirestore()) {
            try {
                firestore.collection(COLLECTION).document(id).set(toMap(request)).get();
            } catch (Exception e) {
                log.error("[Firestore] create error: {}", e.getMessage());
                throw new RuntimeException("承認申請の作成に失敗しました", e);
            }
        } else {
            memStore.add(request);
        }
        return request;
    }

    public ApprovalRequest approve(String id, String approverId, String comment) {
        ApprovalRequest approval = findById(id);
        validateCurrentApprover(approval, approverId);

        ApprovalStep current = approval.getSteps().get(approval.getCurrentStepIndex());
        current.setStatus("approved");
        current.setComment(comment);
        current.setActedAt(Instant.now().toString());

        boolean isLast = approval.getCurrentStepIndex() >= approval.getSteps().size() - 1;
        if (isLast) {
            approval.setStatus("approved");
        } else {
            approval.setCurrentStepIndex(approval.getCurrentStepIndex() + 1);
        }
        approval.setUpdatedAt(Instant.now().toString());
        saveApproval(id, approval);
        return approval;
    }

    public ApprovalRequest reject(String id, String approverId, String comment) {
        ApprovalRequest approval = findById(id);
        validateCurrentApprover(approval, approverId);

        ApprovalStep current = approval.getSteps().get(approval.getCurrentStepIndex());
        current.setStatus("rejected");
        current.setComment(comment);
        current.setActedAt(Instant.now().toString());
        approval.setStatus("rejected");
        approval.setUpdatedAt(Instant.now().toString());
        saveApproval(id, approval);
        return approval;
    }

    public void cancel(String id, String requesterId) {
        ApprovalRequest approval = findById(id);
        if (!approval.getRequesterId().equals(requesterId)) {
            throw new ForbiddenException("申請者本人のみ取消できます");
        }
        approval.setStatus("cancelled");
        approval.setUpdatedAt(Instant.now().toString());
        saveApproval(id, approval);
    }

    private void saveApproval(String id, ApprovalRequest approval) {
        if (useFirestore()) {
            try {
                firestore.collection(COLLECTION).document(id).set(toMap(approval)).get();
            } catch (Exception e) {
                log.error("[Firestore] saveApproval error: {}", e.getMessage());
                throw new RuntimeException("承認申請の保存に失敗しました", e);
            }
        } else {
            memStore.replaceAll(a -> a.getId().equals(id) ? approval : a);
        }
    }

    private void validateCurrentApprover(ApprovalRequest approval, String approverId) {
        if (!"pending".equals(approval.getStatus())) {
            throw new ForbiddenException("処理中の申請ではありません");
        }
        ApprovalStep current = approval.getSteps().get(approval.getCurrentStepIndex());
        if (!current.getApproverId().equals(approverId)) {
            throw new ForbiddenException("現在のステップの承認者ではありません");
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> toMap(Object obj) {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        return mapper.convertValue(obj, Map.class);
    }
}
