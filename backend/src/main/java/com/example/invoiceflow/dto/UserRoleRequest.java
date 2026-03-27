package com.example.invoiceflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** ユーザーロール更新リクエスト */
@Data
public class UserRoleRequest {

    @NotBlank(message = "ロールは必須です")
    private String role;
}
