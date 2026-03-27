package com.example.invoiceflow.service;

import com.example.invoiceflow.dto.PartnerRequest;
import com.example.invoiceflow.exception.ResourceNotFoundException;
import com.example.invoiceflow.model.Partner;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * 取引先サービス
 * Firestore が利用可能な場合は Firestore を使用し、
 * 未設定の場合はインメモリストレージにフォールバックする。
 */
@Service
public class PartnerService {

    private static final Logger log = LoggerFactory.getLogger(PartnerService.class);
    private static final String COLLECTION = "partners";

    @Autowired(required = false)
    private Firestore firestore;

    private final List<Partner> memStore = new CopyOnWriteArrayList<>();

    public PartnerService() {
        memStore.add(Partner.builder().id("p001").name("株式会社サンプル商事").nameKana("カブシキガイシャサンプルショウジ")
                .code("C001").email("info@sample-shoji.co.jp").phone("03-0000-0001")
                .address("東京都千代田区大手町1-1-1").zipCode("100-0004").contactPerson("山田 太郎")
                .invoiceRegistrationNumber("T1234567890123").isActive(true)
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString()).build());
        memStore.add(Partner.builder().id("p002").name("テスト工業株式会社").nameKana("テストコウギョウカブシキガイシャ")
                .code("C002").email("contact@test-kogyo.co.jp").phone("06-0000-0002")
                .address("大阪府大阪市北区梅田2-2-2").zipCode("530-0001").contactPerson("鈴木 花子")
                .invoiceRegistrationNumber("T9876543210987").isActive(true)
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString()).build());
    }

    private boolean useFirestore() { return firestore != null; }

    private Partner docToPartner(QueryDocumentSnapshot doc) {
        Partner p = doc.toObject(Partner.class);
        p.setId(doc.getId());
        return p;
    }

    public List<Partner> findAll(Boolean activeOnly) {
        if (useFirestore()) {
            try {
                var query = firestore.collection(COLLECTION).orderBy("name");
                if (Boolean.TRUE.equals(activeOnly)) query = query.whereEqualTo("isActive", true);
                return query.get().get().getDocuments().stream()
                        .map(this::docToPartner).collect(Collectors.toList());
            } catch (Exception e) {
                log.error("[Firestore] findAll error: {}", e.getMessage());
                throw new RuntimeException("取引先一覧の取得に失敗しました", e);
            }
        }
        return memStore.stream()
                .filter(p -> activeOnly == null || !activeOnly || p.isActive())
                .collect(Collectors.toList());
    }

    public Partner findById(String id) {
        if (useFirestore()) {
            try {
                var doc = firestore.collection(COLLECTION).document(id).get().get();
                if (!doc.exists()) throw new ResourceNotFoundException("取引先が見つかりません: " + id);
                Partner p = doc.toObject(Partner.class);
                assert p != null;
                p.setId(doc.getId());
                return p;
            } catch (ResourceNotFoundException e) {
                throw e;
            } catch (Exception e) {
                log.error("[Firestore] findById error: {}", e.getMessage());
                throw new RuntimeException("取引先の取得に失敗しました", e);
            }
        }
        return memStore.stream().filter(p -> p.getId().equals(id)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("取引先が見つかりません: " + id));
    }

    public Partner create(PartnerRequest req) {
        String id = UUID.randomUUID().toString();
        Partner partner = Partner.builder()
                .id(id).name(req.getName()).nameKana(req.getNameKana())
                .code(req.getCode()).email(req.getEmail()).phone(req.getPhone())
                .address(req.getAddress()).zipCode(req.getZipCode())
                .contactPerson(req.getContactPerson())
                .invoiceRegistrationNumber(req.getInvoiceRegistrationNumber())
                .isActive(req.isActive())
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString())
                .build();

        if (useFirestore()) {
            try {
                firestore.collection(COLLECTION).document(id).set(toMap(partner)).get();
            } catch (Exception e) {
                log.error("[Firestore] create error: {}", e.getMessage());
                throw new RuntimeException("取引先の作成に失敗しました", e);
            }
        } else {
            memStore.add(partner);
        }
        return partner;
    }

    public Partner update(String id, PartnerRequest req) {
        Partner existing = findById(id);
        existing.setName(req.getName()); existing.setNameKana(req.getNameKana());
        existing.setCode(req.getCode()); existing.setEmail(req.getEmail());
        existing.setPhone(req.getPhone()); existing.setAddress(req.getAddress());
        existing.setZipCode(req.getZipCode()); existing.setContactPerson(req.getContactPerson());
        existing.setInvoiceRegistrationNumber(req.getInvoiceRegistrationNumber());
        existing.setActive(req.isActive());
        existing.setUpdatedAt(Instant.now().toString());

        if (useFirestore()) {
            try {
                firestore.collection(COLLECTION).document(id).set(toMap(existing)).get();
            } catch (Exception e) {
                log.error("[Firestore] update error: {}", e.getMessage());
                throw new RuntimeException("取引先の更新に失敗しました", e);
            }
        } else {
            memStore.replaceAll(p -> p.getId().equals(id) ? existing : p);
        }
        return existing;
    }

    public void delete(String id) {
        if (useFirestore()) {
            try {
                Map<String, Object> updates = new HashMap<>();
                updates.put("isActive", false);
                updates.put("updatedAt", Instant.now().toString());
                firestore.collection(COLLECTION).document(id).update(updates).get();
            } catch (Exception e) {
                log.error("[Firestore] delete error: {}", e.getMessage());
                throw new RuntimeException("取引先の削除に失敗しました", e);
            }
        } else {
            Partner partner = findById(id);
            partner.setActive(false);
            partner.setUpdatedAt(Instant.now().toString());
            memStore.replaceAll(p -> p.getId().equals(id) ? partner : p);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> toMap(Object obj) {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        return mapper.convertValue(obj, Map.class);
    }
}
