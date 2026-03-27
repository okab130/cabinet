package com.example.invoiceflow.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;

/**
 * Firebase Admin SDK 初期化設定
 *
 * 認証情報の優先順位:
 *   1. FIREBASE_CREDENTIALS_PATH 環境変数（サービスアカウントキーのJSONファイルパス）
 *   2. Application Default Credentials（Cloud Run / GKE 等のマネージド環境）
 *
 * FIREBASE_PROJECT_ID が未設定の場合は Firebase を初期化せず、
 * サービス層はインメモリストレージにフォールバックする。
 */
@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.project-id:}")
    private String projectId;

    @Value("${firebase.credentials-path:}")
    private String credentialsPath;

    private boolean initialized = false;

    @PostConstruct
    public void initialize() {
        if (projectId == null || projectId.isBlank() || projectId.equals("invoiceflow-demo")) {
            log.warn("[Firebase] FIREBASE_PROJECT_ID が未設定のためFirebaseを初期化しません。インメモリモードで動作します。");
            return;
        }

        if (!FirebaseApp.getApps().isEmpty()) {
            initialized = true;
            return;
        }

        try {
            FirebaseOptions.Builder options = FirebaseOptions.builder()
                    .setProjectId(projectId);

            if (credentialsPath != null && !credentialsPath.isBlank()) {
                log.info("[Firebase] サービスアカウントキーを使用: {}", credentialsPath);
                options.setCredentials(GoogleCredentials.fromStream(
                        new FileInputStream(credentialsPath)));
            } else {
                log.info("[Firebase] Application Default Credentials を使用");
                options.setCredentials(GoogleCredentials.getApplicationDefault());
            }

            FirebaseApp.initializeApp(options.build());
            initialized = true;
            log.info("[Firebase] 初期化完了 - Project: {}", projectId);

        } catch (IOException e) {
            log.error("[Firebase] 初期化失敗: {}。インメモリモードで動作します。", e.getMessage());
        }
    }

    /**
     * Firestore クライアント Bean
     * Firebase が初期化されていない場合は null を返す（サービス層でフォールバック）
     */
    @Bean
    public Firestore firestore() {
        if (!initialized) {
            log.warn("[Firebase] Firestoreは利用不可。インメモリストレージを使用します。");
            return null;
        }
        return FirestoreClient.getFirestore();
    }

    @Bean
    public boolean firebaseInitialized() {
        return initialized;
    }
}
