package com.example.invoiceflow.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 帳票エンティティ
 * Firestore コレクション: invoices
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    private String id;

    /** 送受信区分: "send" | "receive" */
    private String type;

    /** 帳票種類: invoice / delivery_note / quotation / purchase_order / receipt */
    private String docType;

    /** 帳票番号（例: INV-2024-001） */
    private String invoiceNumber;

    private String partnerId;
    private String partnerName;

    /** 税抜金額 */
    private long amount;

    /** 消費税額 */
    private long taxAmount;

    /** 税込合計金額 */
    private long totalAmount;

    /** 発行日（YYYY-MM-DD） */
    private String issueDate;

    /** 支払期限（YYYY-MM-DD） */
    private String dueDate;

    /**
     * ステータス:
     * draft / pending_approval / sent / received / stamped / approved / rejected / cancelled
     */
    private String status;

    private String description;

    /** 電子押印日時（ISO8601） */
    private String stampedAt;

    /** 押印者ユーザーID */
    private String stampedBy;

    private String createdAt;
    private String updatedAt;
    private String createdBy;
}
