package com.example.invoiceflow.security;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Firebase Authentication JWT フィルタ
 *
 * Authorization: Bearer <Firebase IDトークン> ヘッダーを検証し、
 * Spring Security のコンテキストに認証情報をセットする。
 *
 * Firebase が未初期化の場合はフィルタをスキップし、認証なしで通過させる（デモモード）。
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    @Autowired(required = false)
    private Boolean firebaseInitialized;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Firebase 未設定時はスキップ（インメモリモード）
        if (firebaseInitialized == null || !firebaseInitialized) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(token);
            String uid = decoded.getUid();
            String email = decoded.getEmail();

            // カスタムクレームからロールを取得（未設定の場合は "user"）
            Object roleClaim = decoded.getClaims().get("role");
            String role = roleClaim != null ? roleClaim.toString() : "user";

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            uid,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                    );
            // email を details に格納してコントローラーから参照可能にする
            authentication.setDetails(email);
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            log.warn("[JWT] トークン検証失敗: {}", e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
