package com.example.invoiceflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/** 取引先作成/更新リクエスト */
@Data
public class PartnerRequest {

    @NotBlank(message = "会社名は必須です")
    private String name;

    private String nameKana;

    @NotBlank(message = "取引先コードは必須です")
    private String code;

    @Email(message = "メールアドレスの形式が正しくありません")
    private String email;

    private String phone;
    private String address;
    private String zipCode;
    private String contactPerson;

    /** 適格請求書発行事業者登録番号（T + 13桁） */
    @Pattern(regexp = "^T\\d{13}$", message = "インボイス登録番号は T + 13桁の形式で入力してください")
    private String invoiceRegistrationNumber;

    private boolean isActive = true;
}
