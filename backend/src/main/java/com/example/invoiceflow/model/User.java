package com.example.invoiceflow.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * ユーザーエンティティ
 * Firestore コレクション: users
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    private String id;
    private String displayName;
    private String email;
    private String department;

    /** ロール: admin / manager / user / viewer */
    private String role;

    private String createdAt;
    private String updatedAt;
}
