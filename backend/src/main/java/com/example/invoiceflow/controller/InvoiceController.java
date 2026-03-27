package com.example.invoiceflow.controller;

import com.example.invoiceflow.dto.InvoiceCreateRequest;
import com.example.invoiceflow.model.Invoice;
import com.example.invoiceflow.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 帳票 REST API コントローラー
 *
 * GET    /api/invoices              帳票一覧
 * GET    /api/invoices/{id}         帳票詳細
 * POST   /api/invoices              帳票作成
 * PUT    /api/invoices/{id}         帳票更新
 * POST   /api/invoices/{id}/stamp   電子押印
 * DELETE /api/invoices/{id}         帳票削除（論理削除）
 */
@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    /**
     * 帳票一覧取得
     * @param type      送受信区分 (send/receive)
     * @param status    ステータスフィルタ
     * @param partnerId 取引先IDフィルタ
     */
    @GetMapping
    public ResponseEntity<List<Invoice>> list(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String partnerId) {
        return ResponseEntity.ok(invoiceService.findAll(type, status, partnerId));
    }

    /**
     * 帳票詳細取得
     */
    @GetMapping("/{id}")
    public ResponseEntity<Invoice> get(@PathVariable String id) {
        return ResponseEntity.ok(invoiceService.findById(id));
    }

    /**
     * 帳票新規作成
     * 承認者IDリストが指定された場合は承認申請も同時に作成する
     */
    @PostMapping
    public ResponseEntity<Invoice> create(@Valid @RequestBody InvoiceCreateRequest request) {
        // TODO: 認証済みユーザーIDを取得 (SecurityContext)
        String createdBy = "current-user";
        Invoice created = invoiceService.create(request, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 帳票更新
     */
    @PutMapping("/{id}")
    public ResponseEntity<Invoice> update(@PathVariable String id, @RequestBody Invoice invoice) {
        return ResponseEntity.ok(invoiceService.update(id, invoice));
    }

    /**
     * 電子押印
     * 受領確認としてタイムスタンプ付きの電子押印を記録する
     */
    @PostMapping("/{id}/stamp")
    public ResponseEntity<Invoice> stamp(@PathVariable String id) {
        // TODO: 認証済みユーザーIDを取得
        String userId = "current-user";
        return ResponseEntity.ok(invoiceService.stamp(id, userId));
    }

    /**
     * 帳票削除（論理削除: status = cancelled）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        invoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
