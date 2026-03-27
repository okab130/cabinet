package com.example.invoiceflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.util.List;

/** 帳票作成リクエスト */
@Data
public class InvoiceCreateRequest {

    @NotBlank(message = "帳票種類は必須です")
    private String docType;

    @NotBlank(message = "取引先IDは必須です")
    private String partnerId;

    private String invoiceNumber;

    @NotNull(message = "金額は必須です")
    @Positive(message = "金額は正の値を入力してください")
    private Long amount;

    @NotBlank(message = "発行日は必須です")
    private String issueDate;

    @NotBlank(message = "支払期限は必須です")
    private String dueDate;

    private String description;

    /** 承認者IDリスト（空の場合は即時送信） */
    private List<String> approverIds;
}
