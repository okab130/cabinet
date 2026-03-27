package com.example.invoiceflow.dto;

import lombok.Data;

/** 承認/差戻しアクションリクエスト */
@Data
public class ApprovalActionRequest {

    /** コメント（任意） */
    private String comment;
}
