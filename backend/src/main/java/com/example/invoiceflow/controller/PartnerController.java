package com.example.invoiceflow.controller;

import com.example.invoiceflow.dto.PartnerRequest;
import com.example.invoiceflow.model.Partner;
import com.example.invoiceflow.service.PartnerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 取引先 REST API コントローラー
 *
 * GET    /api/partners              取引先一覧
 * GET    /api/partners/{id}         取引先詳細
 * POST   /api/partners              取引先作成
 * PUT    /api/partners/{id}         取引先更新
 * DELETE /api/partners/{id}         取引先削除（論理削除）
 */
@RestController
@RequestMapping("/api/partners")
@CrossOrigin(origins = "http://localhost:5173")
public class PartnerController {

    @Autowired
    private PartnerService partnerService;

    /**
     * 取引先一覧取得
     * @param activeOnly true の場合は有効な取引先のみ返す
     */
    @GetMapping
    public ResponseEntity<List<Partner>> list(
            @RequestParam(required = false) Boolean activeOnly) {
        return ResponseEntity.ok(partnerService.findAll(activeOnly));
    }

    /**
     * 取引先詳細取得
     */
    @GetMapping("/{id}")
    public ResponseEntity<Partner> get(@PathVariable String id) {
        return ResponseEntity.ok(partnerService.findById(id));
    }

    /**
     * 取引先新規作成
     * インボイス登録番号（T + 13桁）のバリデーションを実施
     */
    @PostMapping
    public ResponseEntity<Partner> create(@Valid @RequestBody PartnerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(partnerService.create(request));
    }

    /**
     * 取引先更新
     */
    @PutMapping("/{id}")
    public ResponseEntity<Partner> update(
            @PathVariable String id,
            @Valid @RequestBody PartnerRequest request) {
        return ResponseEntity.ok(partnerService.update(id, request));
    }

    /**
     * 取引先削除（論理削除: isActive = false）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        partnerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
