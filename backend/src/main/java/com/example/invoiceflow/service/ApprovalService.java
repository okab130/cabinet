package com.example.invoiceflow.service;

import com.example.invoiceflow.exception.ForbiddenException;
import com.example.invoiceflow.exception.ResourceNotFoundException;
import com.example.invoiceflow.model.ApprovalRequest;
import com.example.invoiceflow.model.ApprovalStep;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * 承認フローサービス
 */
@Service
public class ApprovalService {

    private final List<ApprovalRequest> store = new CopyOnWriteArrayList<>();

    public ApprovalService() {
        // デモデータ初期化
        ApprovalStep step1 = ApprovalStep.builder()
                .stepIndex(0).approverId("u002").approverName("田中 花子")
                .status("approved").comment("確認しました").actedAt(Instant.now().toString())
                .build();
        ApprovalStep step2 = ApprovalStep.builder()
                .stepIndex(1).approverId("u003").approverName("鈴木 太郎")
                .status("pending")
                .build();

        store.add(ApprovalRequest.builder()
                .id("apr001").type("invoice_send").invoiceId("inv001")
                .title("2024年10月分 システム開発費 送信承認申請")
                .description("株式会社サンプル商事への請求書送信の承認をお願いします")
                .requesterId("u001").requesterName("管理者")
                .currentStepIndex(1)
                .steps(List.of(step1, step2))
                .status("pending")
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString())
                .build());
    }

    /** 承認申請一覧 */
    public List<ApprovalRequest> findAll(String status) {
        return store.stream()
                .filter(a -> status == null || a.getStatus().equals(status))
                .collect(Collectors.toList());
    }

    /** 承認申請詳細 */
    public ApprovalRequest findById(String id) {
        return store.stream()
                .filter(a -> a.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("承認申請が見つかりません: " + id));
    }

    /** 承認申請作成 */
    public ApprovalRequest create(ApprovalRequest request) {
        request.setId(UUID.randomUUID().toString());
        request.setStatus("pending");
        request.setCurrentStepIndex(0);
        request.setCreatedAt(Instant.now().toString());
        request.setUpdatedAt(Instant.now().toString());
        store.add(request);
        return request;
    }

    /** ステップ承認 */
    public ApprovalRequest approve(String id, String approverId, String comment) {
        ApprovalRequest approval = findById(id);
        validateCurrentApprover(approval, approverId);

        ApprovalStep current = approval.getSteps().get(approval.getCurrentStepIndex());
        current.setStatus("approved");
        current.setComment(comment);
        current.setActedAt(Instant.now().toString());

        boolean allApproved = approval.getCurrentStepIndex() >= approval.getSteps().size() - 1;
        if (allApproved) {
            approval.setStatus("approved");
        } else {
            approval.setCurrentStepIndex(approval.getCurrentStepIndex() + 1);
        }
        approval.setUpdatedAt(Instant.now().toString());
        store.replaceAll(a -> a.getId().equals(id) ? approval : a);
        return approval;
    }

    /** ステップ差戻し */
    public ApprovalRequest reject(String id, String approverId, String comment) {
        ApprovalRequest approval = findById(id);
        validateCurrentApprover(approval, approverId);

        ApprovalStep current = approval.getSteps().get(approval.getCurrentStepIndex());
        current.setStatus("rejected");
        current.setComment(comment);
        current.setActedAt(Instant.now().toString());
        approval.setStatus("rejected");
        approval.setUpdatedAt(Instant.now().toString());
        store.replaceAll(a -> a.getId().equals(id) ? approval : a);
        return approval;
    }

    /** 申請取消 */
    public void cancel(String id, String requesterId) {
        ApprovalRequest approval = findById(id);
        if (!approval.getRequesterId().equals(requesterId)) {
            throw new ForbiddenException("申請者本人のみ取消できます");
        }
        approval.setStatus("cancelled");
        approval.setUpdatedAt(Instant.now().toString());
        store.replaceAll(a -> a.getId().equals(id) ? approval : a);
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
}
