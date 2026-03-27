package com.example.invoiceflow.controller;

import com.example.invoiceflow.dto.ApprovalActionRequest;
import com.example.invoiceflow.model.ApprovalRequest;
import com.example.invoiceflow.service.ApprovalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 承認フロー REST API コントローラー
 *
 * GET    /api/approvals              承認申請一覧
 * GET    /api/approvals/{id}         承認申請詳細
 * POST   /api/approvals              承認申請作成
 * POST   /api/approvals/{id}/approve ステップ承認
 * POST   /api/approvals/{id}/reject  ステップ差戻し
 * POST   /api/approvals/{id}/cancel  申請取消
 */
@RestController
@RequestMapping("/api/approvals")
@CrossOrigin(origins = "http://localhost:5173")
public class ApprovalController {

    @Autowired
    private ApprovalService approvalService;

    /**
     * 承認申請一覧取得
     * @param status ステータスフィルタ (pending/approved/rejected/cancelled)
     */
    @GetMapping
    public ResponseEntity<List<ApprovalRequest>> list(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(approvalService.findAll(status));
    }

    /**
     * 承認申請詳細取得
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApprovalRequest> get(@PathVariable String id) {
        return ResponseEntity.ok(approvalService.findById(id));
    }

    /**
     * 承認申請作成
     */
    @PostMapping
    public ResponseEntity<ApprovalRequest> create(@RequestBody ApprovalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(approvalService.create(request));
    }

    /**
     * ステップ承認
     * 現在のステップを「承認済み」に更新し、次ステップへ進める
     * 最終ステップ承認時は申請全体を「承認完了」にする
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApprovalRequest> approve(
            @PathVariable String id,
            @RequestBody(required = false) ApprovalActionRequest request) {
        // TODO: 認証済みユーザーIDを取得
        String approverId = "current-user";
        String comment = request != null ? request.getComment() : null;
        return ResponseEntity.ok(approvalService.approve(id, approverId, comment));
    }

    /**
     * ステップ差戻し
     * 現在のステップを「差戻し」に更新し、申請全体を「差戻し」状態にする
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApprovalRequest> reject(
            @PathVariable String id,
            @RequestBody(required = false) ApprovalActionRequest request) {
        // TODO: 認証済みユーザーIDを取得
        String approverId = "current-user";
        String comment = request != null ? request.getComment() : null;
        return ResponseEntity.ok(approvalService.reject(id, approverId, comment));
    }

    /**
     * 承認申請取消
     * 申請者本人のみ取消可能
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable String id) {
        // TODO: 認証済みユーザーIDを取得
        String requesterId = "current-user";
        approvalService.cancel(id, requesterId);
        return ResponseEntity.noContent().build();
    }
}
