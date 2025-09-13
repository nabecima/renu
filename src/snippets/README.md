# HTML Snippets システム

このプロジェクトのHTMLスニペットシステムは、HTMLファイルのheadタグやbodyタグに自動的にコードスニペットを挿入する機能です。Google Analytics、Font Awesome、その他のサードパーティライブラリなどの共通コードを効率的に管理できます。

## 📁 ディレクトリ構造

```
src/snippets/
├── config.json           # スニペット設定ファイル
├── head-snippet.html     # head内に挿入するスニペット
├── body-snippet.html     # body内に挿入するスニペット
└── README.md            # このファイル
```

## 🔧 基本的な使い方

### 1. スニペットファイルの作成

スニペットファイルは`.html`形式で作成し、挿入先に応じて命名します：

- `head-***.html` → `<head>`タグ内に挿入
- `body-***.html` → `<body>`タグ内に挿入

#### 例：Google Analyticsの設定
```html
<!-- head-analytics.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

#### 例：Font Awesomeの設定
```html
<!-- head-fontawesome.html -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

### 2. 設定ファイル（config.json）

設定ファイルで、どのスニペットをどのHTMLファイルに適用するかを制御します。

#### 基本構造
```json
{
  "snippet-name": {
    "applyTo": ["適用対象ファイル"],
    "excludeFrom": ["除外対象ファイル"],
    "priority": 0,
    "position": "prepend"
  }
}
```

## 📝 config.json詳細設定

### applyTo オプション

スニペットを適用するファイルを指定します。

#### 全ファイルに適用
```json
{
  "head-analytics": {
    "applyTo": ["all"]
  }
}
```

#### 特定のファイルに適用
```json
{
  "head-analytics": {
    "applyTo": ["index.html", "about.html"]
  }
}
```

#### ワイルドカード使用
```json
{
  "head-analytics": {
    "applyTo": ["contact/*", "blog/*.html"]
  }
}
```

### excludeFrom オプション

特定のファイルから除外します。

```json
{
  "head-analytics": {
    "applyTo": ["all"],
    "excludeFrom": ["admin.html", "test/*"]
  }
}
```

### priority オプション

スニペットの挿入順序を制御します（数値が小さいほど先に挿入）。

```json
{
  "head-meta": {
    "applyTo": ["all"],
    "priority": 1
  },
  "head-analytics": {
    "applyTo": ["all"],
    "priority": 10
  }
}
```

### position オプション

スニペットの挿入位置を制御します。

```json
{
  "head-meta": {
    "applyTo": ["all"],
    "position": "prepend"  // headタグの先頭に挿入（デフォルト）
  },
  "head-analytics": {
    "applyTo": ["all"],
    "position": "append"   // headタグの末尾に挿入
  }
}
```

### noObfuscate オプション

スニペット内のコードを難読化から除外したい場合に使用します。

```json
{
  "head-analytics": {
    "applyTo": ["all"],
    "noObfuscate": true  // このスニペットは難読化しない
  }
}
```

**使用例：**
- デバッグ用コード
- 外部サービスのトラッキングコード
- 可読性を保ちたいカスタムスクリプト

## 🎯 実践的な設定例

### 例1: 基本的なメタタグとアナリティクス
```json
{
  "head-meta": {
    "applyTo": ["all"],
    "priority": 1,
    "position": "prepend"
  },
  "head-analytics": {
    "applyTo": ["all"],
    "excludeFrom": ["admin.html", "test/*"],
    "priority": 10,
    "position": "append"
  }
}
```

### 例2: ページ固有のスニペット
```json
{
  "head-contact-form": {
    "applyTo": ["contact.html", "contact/*"],
    "priority": 5
  },
  "body-blog-script": {
    "applyTo": ["blog/*"],
    "priority": 1
  },
  "head-thanks-conversion": {
    "applyTo": ["thanks/index.html"],
    "priority": 10,
    "noObfuscate": true
  }
}
```

### 例3: 環境別設定
```json
{
  "head-dev-tools": {
    "applyTo": ["all"],
    "excludeFrom": ["index.html"]
  },
  "head-production-analytics": {
    "applyTo": ["index.html"]
  }
}
```

## 🔍 パスパターンの詳細

### 完全一致
```json
"applyTo": ["index.html"]  // index.htmlのみ
```

### ワイルドカード
```json
"applyTo": ["contact/*"]     // contactディレクトリ内の全ファイル
"applyTo": ["*.html"]        // .htmlで終わる全ファイル
"applyTo": ["blog/*.html"]   // blogディレクトリ内の.htmlファイル
```

### 複数パターン
```json
"applyTo": ["index.html", "about.html", "contact/*", "thanks/index.html"]
```

## 📋 スニペットファイルの命名規則

### 自動判定ルール

- `head-***.html` → `<head>`タグ内に挿入
- `body-***.html` → `<body>`タグ内に挿入
- その他 → `<body>`タグ内に挿入（デフォルト）

### 推奨命名パターン

```
head-meta.html         # メタタグ
head-analytics.html    # アナリティクス
head-fonts.html        # フォント読み込み
head-css.html          # 外部CSS
body-scripts.html      # JavaScript
body-tracking.html     # トラッキングコード
head-thanks-conversion.html  # サンクスページ用コンバージョン計測
```

## 🚀 ビルドコマンドオプション

### スニペット挿入あり（デフォルト）
```bash
npm run build
npm run dev
```

### スニペット挿入なし
```bash
npm run build -- --no-snippets
npm run test  # テストビルド（スニペット挿入なし）
```

## 🔧 よくある使用例

### 1. Google Analytics 4
```html
<!-- head-ga4.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 2. Font Awesome
```html
<!-- head-fontawesome.html -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

### 3. Google Fonts
```html
<!-- head-fonts.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
```

### 4. メタタグ
```html
<!-- head-meta.html -->
<meta property="og:title" content="サイトタイトル">
<meta property="og:description" content="サイトの説明">
<meta property="og:image" content="/images/og-image.jpg">
<meta property="og:url" content="https://example.com">
<meta name="twitter:card" content="summary_large_image">
```

### 5. JSONスキーマ
```html
<!-- head-schema.html -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "サイト名",
  "url": "https://example.com"
}
</script>
```

### 6. サンクスページ用コンバージョン計測
```html
<!-- head-thanks-conversion.html -->
<script>
  // Google Analytics コンバージョン計測
  gtag('event', 'conversion', {
    'send_to': 'AW-XXXXXXXXX/XXXXXXXXX',
    'transaction_id': ''
  });
  
  // Facebook Pixel コンバージョン計測
  fbq('track', 'Purchase', {
    currency: 'JPY',
    value: 10000
  });
</script>
```

対応するconfig.json：
```json
{
  "head-thanks-conversion": {
    "applyTo": ["thanks/index.html"],
    "priority": 10,
    "noObfuscate": true
  }
}
```

## 🔍 デバッグとトラブルシューティング

### ログ出力の確認
ビルド時に以下のログが出力されます：

```
HTML スニペット読み込み: head-analytics
HTML head-analytics を head に挿入 (index.html) [優先度: 10, 位置: append]
```

### よくある問題と解決策

#### 1. スニペットが挿入されない
```bash
# config.jsonの設定を確認
# applyToに対象ファイルが含まれているか確認
```

#### 2. 挿入順序が期待と異なる
```json
// priorityの値を調整
{
  "head-meta": {
    "priority": 1  // 先に挿入
  },
  "head-analytics": {
    "priority": 10  // 後に挿入
  }
}
```

#### 3. HTMLが壊れる
```html
<!-- スニペットの構文エラーをチェック -->
<!-- 閉じタグの確認 -->
<!-- 文字エンコーディングの確認 -->
```

## 📈 パフォーマンス最適化

### 1. スニペットの最小化
- 不要な改行やスペースを削除
- コメントを削除
- CSS/JSは外部ファイル化を検討

### 2. 読み込み優先度の調整
```html
<!-- 重要なリソースは先に読み込み -->
<link rel="preload" href="..." as="style">
<link rel="preload" href="..." as="script">
```

### 3. 非同期読み込み
```html
<script async src="..."></script>
<script defer src="..."></script>
```

## 🔒 セキュリティ考慮事項

### 1. 外部リソースの検証
```html
<!-- SRI（Subresource Integrity）の使用 -->
<script src="https://example.com/script.js" 
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

### 2. Content Security Policy
```html
<!-- head-csp.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline' https://trusted-site.com;">
```

## 📚 高度な使用方法

### 1. 条件付きスニペット
```html
<!-- head-ie-support.html -->
<!--[if lt IE 9]>
<script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
<![endif]-->
```

### 2. 環境変数を使用した動的スニペット
```html
<!-- head-env.html -->
<script>
  window.ENV = {
    API_URL: 'https://api.example.com',
    DEBUG: false
  };
</script>
```

### 3. 複数のスニペットの組み合わせ
```json
{
  "head-preload": {
    "applyTo": ["all"],
    "priority": 1
  },
  "head-fonts": {
    "applyTo": ["all"],
    "priority": 2
  },
  "head-analytics": {
    "applyTo": ["all"],
    "priority": 10
  },
  "head-thanks-conversion": {
    "applyTo": ["thanks/index.html"],
    "priority": 15,
    "noObfuscate": true
  }
}
```

このスニペットシステムを活用することで、HTMLファイルの保守性を大幅に向上させ、共通コードの管理を効率化できます。設定の柔軟性により、プロジェクトの要件に応じて細かく制御することが可能です。