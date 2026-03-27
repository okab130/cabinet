package com.example.invoiceflow.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 取引先エンティティ
 * Firestore コレクション: partners
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Partner {

    private String id;
    private String name;
    private String nameKana;
    private String code;
    private String email;
    private String phone;
    private String address;
    private String zipCode;
    private String contactPerson;

    /** 適格請求書発行事業者登録番号（T + 13桁） */
    private String invoiceRegistrationNumber;

    private boolean isActive;
    private String createdAt;
    private String updatedAt;
}
