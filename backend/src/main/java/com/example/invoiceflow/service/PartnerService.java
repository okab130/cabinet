package com.example.invoiceflow.service;

import com.example.invoiceflow.dto.PartnerRequest;
import com.example.invoiceflow.exception.ResourceNotFoundException;
import com.example.invoiceflow.model.Partner;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * 取引先サービス
 */
@Service
public class PartnerService {

    private final List<Partner> store = new CopyOnWriteArrayList<>();

    public PartnerService() {
        store.add(Partner.builder().id("p001").name("株式会社サンプル商事").nameKana("カブシキガイシャサンプルショウジ")
                .code("C001").email("info@sample-shoji.co.jp").phone("03-0000-0001")
                .address("東京都千代田区大手町1-1-1").zipCode("100-0004").contactPerson("山田 太郎")
                .invoiceRegistrationNumber("T1234567890123").isActive(true)
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString()).build());
        store.add(Partner.builder().id("p002").name("テスト工業株式会社").nameKana("テストコウギョウカブシキガイシャ")
                .code("C002").email("contact@test-kogyo.co.jp").phone("06-0000-0002")
                .address("大阪府大阪市北区梅田2-2-2").zipCode("530-0001").contactPerson("鈴木 花子")
                .invoiceRegistrationNumber("T9876543210987").isActive(true)
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString()).build());
    }

    /** 取引先一覧（有効フィルタ対応） */
    public List<Partner> findAll(Boolean activeOnly) {
        return store.stream()
                .filter(p -> activeOnly == null || !activeOnly || p.isActive())
                .collect(Collectors.toList());
    }

    /** 取引先詳細 */
    public Partner findById(String id) {
        return store.stream()
                .filter(p -> p.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("取引先が見つかりません: " + id));
    }

    /** 取引先作成 */
    public Partner create(PartnerRequest req) {
        Partner partner = Partner.builder()
                .id(UUID.randomUUID().toString())
                .name(req.getName()).nameKana(req.getNameKana())
                .code(req.getCode()).email(req.getEmail()).phone(req.getPhone())
                .address(req.getAddress()).zipCode(req.getZipCode())
                .contactPerson(req.getContactPerson())
                .invoiceRegistrationNumber(req.getInvoiceRegistrationNumber())
                .isActive(req.isActive())
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString())
                .build();
        store.add(partner);
        return partner;
    }

    /** 取引先更新 */
    public Partner update(String id, PartnerRequest req) {
        Partner existing = findById(id);
        existing.setName(req.getName());
        existing.setNameKana(req.getNameKana());
        existing.setCode(req.getCode());
        existing.setEmail(req.getEmail());
        existing.setPhone(req.getPhone());
        existing.setAddress(req.getAddress());
        existing.setZipCode(req.getZipCode());
        existing.setContactPerson(req.getContactPerson());
        existing.setInvoiceRegistrationNumber(req.getInvoiceRegistrationNumber());
        existing.setActive(req.isActive());
        existing.setUpdatedAt(Instant.now().toString());
        store.replaceAll(p -> p.getId().equals(id) ? existing : p);
        return existing;
    }

    /** 取引先削除（論理削除） */
    public void delete(String id) {
        Partner partner = findById(id);
        partner.setActive(false);
        partner.setUpdatedAt(Instant.now().toString());
        store.replaceAll(p -> p.getId().equals(id) ? partner : p);
    }
}
