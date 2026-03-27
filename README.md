# InvoiceFlow — 電子取引管理システム

> WingArc1st「invoiceAgent 電子取引」をリファレンスに設計した電子帳票管理Webアプリケーション

[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![MUI](https://img.shields.io/badge/MUI-v7-blue)](https://mui.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-green)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange)](https://openjdk.org/)

---

## 概要

InvoiceFlow は、企業間の電子帳票（請求書・納品書・見積書・発注書）の送受信・管理・承認を一元化するWebアプリケーションです。

- **電帳法（電子帳簿保存法）対応** — 電子押印・タイムスタンプ記録
- **インボイス制度対応** — 適格請求書発行事業者登録番号管理
- **社内承認ワークフロー** — ReactFlow による多段階承認の可視化
- **PDF/Excel帳票出力** — ブラウザ直接PDF + サーバーサイド帳票生成

---

## 主要機能

| 機能 | 説明 |
|------|------|
| ダッシュボード | KPI・月別グラフ・処理待ち一覧 |
| 帳票送信 | 請求書等の新規作成・送信・承認申請 |
| 帳票受信 | 受信帳票の管理・電子押印・PDF出力 |
| 承認ワークフロー | ReactFlow による承認フロー可視化・承認/差戻し操作 |
| 取引先管理 | CRUD操作・インボイス登録番号管理 |
| 文書管理 | フォルダツリー形式でのファイル管理 |
| 帳票出力 | PDF（@react-pdf/renderer）・Excel（Apache POI）帳票生成 |
| ユーザー管理 | ロールベースアクセス制御（admin/manager/user/viewer） |

---

## 技術スタック

### フロントエンド

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| React + TypeScript | 18 / 5 | UIフレームワーク |
| Vite | 5.x | ビルドツール |
| MUI (Material UI) | v7 | UIコンポーネント |
| React Router | v6 | ルーティング |
| Zustand | 4.x | 状態管理 |
| TanStack Table | v8 | データテーブル |
| @xyflow/react | v12 | ワークフロー可視化 |
| Recharts | 2.x | グラフ |
| @react-pdf/renderer | 3.x | PDF帳票生成 |

### バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Spring Boot | 3.2 | REST API |
| Java | 21 | サーバーサイド言語 |
| Apache PDFBox | 3.x | PDF帳票生成 |
| Apache POI | 5.x | Excel帳票生成 |
| Firebase Admin SDK | 9.x | Firestore接続（将来） |

---

## セットアップ・起動手順

### 前提条件

- Node.js v20.x
- Java 21（バックエンド起動時のみ）
- Maven 3.9.x（バックエンド起動時のみ）

### 1. フロントエンド

```bash
git clone https://github.com/okab130/cabinet.git
cd cabinet
npm install --legacy-peer-deps
npm run dev
```

アクセス: **http://localhost:5173/**

### 2. バックエンドAPI（オプション）

```bash
cd backend
mvn spring-boot:run
```

アクセス: **http://localhost:8080/api/health**

---

## デモアカウント

| メールアドレス | ロール | 権限 |
|--------------|--------|------|
| admin@example.com | 管理者 | 全機能 + ユーザー管理 |
| tanaka@example.com | マネージャー | 全機能 + 承認操作 |
| suzuki@example.com | 一般ユーザー | 帳票送受信・申請 |
| viewer@example.com | 閲覧者 | 閲覧のみ |

> パスワードは任意（モック認証）

---

## APIエンドポイント一覧

| メソッド | エンドポイント | 機能 |
|---------|--------------|------|
| GET | `/api/health` | ヘルスチェック |
| GET/POST | `/api/invoices` | 帳票一覧・作成 |
| GET/PUT/DELETE | `/api/invoices/{id}` | 帳票詳細・更新・削除 |
| POST | `/api/invoices/{id}/stamp` | 電子押印 |
| GET/POST | `/api/approvals` | 承認申請一覧・作成 |
| POST | `/api/approvals/{id}/approve` | ステップ承認 |
| POST | `/api/approvals/{id}/reject` | ステップ差戻し |
| POST | `/api/approvals/{id}/cancel` | 申請取消 |
| GET/POST | `/api/partners` | 取引先一覧・作成 |
| GET/PUT/DELETE | `/api/partners/{id}` | 取引先詳細・更新・削除 |
| GET | `/api/reports/{id}/pdf` | PDF帳票ダウンロード |
| GET | `/api/reports/{id}/excel` | Excel帳票ダウンロード |
| GET/POST/PUT | `/api/users` | ユーザー管理 |

---

## プロジェクト構成

```
invoice-agent-app/
├── src/                    # フロントエンド（React + TypeScript）
│   ├── components/         # 再利用可能コンポーネント
│   ├── pages/              # 画面コンポーネント
│   ├── store/              # Zustand状態管理
│   ├── types/              # TypeScript型定義
│   └── data/               # モックデータ
├── backend/                # バックエンド（Spring Boot）
│   ├── pom.xml
│   └── src/main/java/com/example/invoiceflow/
│       ├── controller/     # REST APIコントローラー
│       ├── service/        # ビジネスロジック
│       ├── model/          # エンティティ
│       ├── dto/            # リクエストDTO
│       └── exception/      # 例外ハンドラー
└── docs/
    ├── システム概要書.md
    └── システム詳細設計書.md
```

---

## ドキュメント

| ファイル | 内容 | 対象 |
|---------|------|------|
| [docs/システム概要書.md](docs/システム概要書.md) | 機能概要・法令対応・期待効果 | 経営層・業務担当者 |
| [docs/システム詳細設計書.md](docs/システム詳細設計書.md) | アーキテクチャ・API設計・データモデル | 開発者 |

---

## ビルド

```bash
npm run build
# → dist/ に出力
```

---

*InvoiceFlow v1.0.0 — 電帳法・インボイス制度対応 電子取引管理システム*
