package com.example.invoiceflow.controller;

import com.example.invoiceflow.dto.UserRoleRequest;
import com.example.invoiceflow.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * ユーザー管理 REST API コントローラー
 * ※ admin ロールのみアクセス可能（本番: Spring Security で制御）
 *
 * GET  /api/users              ユーザー一覧
 * POST /api/users              ユーザー作成
 * PUT  /api/users/{id}         ユーザー情報更新
 * PUT  /api/users/{id}/role    ロール変更
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final List<User> store = new CopyOnWriteArrayList<>();

    public UserController() {
        store.add(User.builder().id("u001").displayName("管理者").email("admin@example.com")
                .department("システム部").role("admin")
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString()).build());
        store.add(User.builder().id("u002").displayName("田中 花子").email("tanaka@example.com")
                .department("経理部").role("manager")
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString()).build());
        store.add(User.builder().id("u003").displayName("鈴木 太郎").email("suzuki@example.com")
                .department("営業部").role("user")
                .createdAt(Instant.now().toString()).updatedAt(Instant.now().toString()).build());
    }

    /** ユーザー一覧取得 */
    @GetMapping
    public ResponseEntity<List<User>> list() {
        return ResponseEntity.ok(store);
    }

    /** ユーザー作成 */
    @PostMapping
    public ResponseEntity<User> create(@RequestBody User user) {
        user.setId(UUID.randomUUID().toString());
        user.setCreatedAt(Instant.now().toString());
        user.setUpdatedAt(Instant.now().toString());
        store.add(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    /** ユーザー情報更新 */
    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable String id, @RequestBody User updated) {
        User existing = store.stream().filter(u -> u.getId().equals(id)).findFirst()
                .orElseThrow(() -> new com.example.invoiceflow.exception.ResourceNotFoundException("ユーザーが見つかりません: " + id));
        existing.setDisplayName(updated.getDisplayName());
        existing.setDepartment(updated.getDepartment());
        existing.setUpdatedAt(Instant.now().toString());
        store.replaceAll(u -> u.getId().equals(id) ? existing : u);
        return ResponseEntity.ok(existing);
    }

    /**
     * ロール変更（admin のみ実行可能）
     * 有効なロール: admin / manager / user / viewer
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<User> updateRole(
            @PathVariable String id,
            @RequestBody UserRoleRequest request) {
        User user = store.stream().filter(u -> u.getId().equals(id)).findFirst()
                .orElseThrow(() -> new com.example.invoiceflow.exception.ResourceNotFoundException("ユーザーが見つかりません: " + id));
        user.setRole(request.getRole());
        user.setUpdatedAt(Instant.now().toString());
        store.replaceAll(u -> u.getId().equals(id) ? user : u);
        return ResponseEntity.ok(user);
    }
}
