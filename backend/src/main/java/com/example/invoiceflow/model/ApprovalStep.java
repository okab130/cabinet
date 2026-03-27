package com.example.invoiceflow.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 承認ステップ（ApprovalRequest.steps の要素）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalStep {

    /** ステップ番号（0始まり） */
    private int stepIndex;

    private String approverId;
    private String approverName;

    /** ステータス: pending / approved / rejected */
    private String status;

    private String comment;

    /** 承認/差戻し操作日時（ISO8601） */
    private String actedAt;
}
