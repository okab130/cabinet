package com.example.invoiceflow.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

/**
 * 承認申請エンティティ
 * Firestore コレクション: approvals
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequest {

    private String id;

    /** 申請種別: "invoice_send" | "invoice_receive" */
    private String type;

    private String invoiceId;
    private String title;
    private String description;
    private String requesterId;
    private String requesterName;

    /** 現在の承認ステップインデックス（0始まり） */
    private int currentStepIndex;

    private List<ApprovalStep> steps;

    /** ステータス: pending / approved / rejected / cancelled */
    private String status;

    private String createdAt;
    private String updatedAt;
}
