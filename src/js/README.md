# JavaScript機能選択ガイド

このドキュメントでは、`main.js`でどの機能を有効化すべきかの判断基準を説明します。

## 機能別有効化ガイド

### 🎥 YouTube遅延読み込み機能

#### こんな時に有効化:
- ページにYouTube動画を埋め込んでいる
- 動画が複数ある、または動画のファイルサイズが大きい
- ページの初期読み込み速度を改善したい
- モバイル環境でのデータ使用量を削減したい

#### 有効化方法:
```javascript
// 1. インポート文のコメントアウトを外す
import LazyYouTubeLoader from './modules/lazy-youtube-loader/LazyYouTubeLoader.js';

// 2. 初期化コードのコメントアウトを外す
new LazyYouTubeLoader({
  debug: false // 開発時はtrueに変更
});
```

#### HTML例:
```html
<div class="js-lazy-youtube" data-src="https://www.youtube.com/embed/VIDEO_ID">
  <!-- プレースホルダー表示 -->
</div>
```

---

### 🗺️ Google Map遅延読み込み機能

#### こんな時に有効化:
- ページにGoogle Mapを埋め込んでいる
- 地図が複数ある、または詳細な地図を表示している
- ページの初期読み込み速度を改善したい
- APIキーを使わずに地図を表示したい

#### 有効化方法:
```javascript
// 1. インポート文のコメントアウトを外す
import LazyGoogleMapLoader from './modules/lazy-google-map-loader/LazyGoogleMapLoader.js';

// 2. 初期化コードのコメントアウトを外す
new LazyGoogleMapLoader({
  debug: false // 開発時はtrueに変更
});
```

#### HTML例:
```html
<!-- 直接URL指定 -->
<div class="js-lazy-map" data-src="https://www.google.com/maps/embed?pb=...">
</div>

<!-- 座標指定 -->
<div class="js-lazy-map" data-lat="35.6812" data-lng="139.7671">
</div>
```

---

### ⚡ レスポンシブスムーススクロール機能

#### こんな時に有効化:
- ページ内アンカーリンクを使用している
- ナビゲーションメニューからのスムーズスクロールが必要
- ユーザビリティを向上させたい
- 長いページでセクション間の移動を改善したい

#### 有効化方法:
```javascript
// 1. インポート文のコメントアウトを外す
import ResponsiveSmoothScroll from './modules/responsive-smooth-scroll/ResponsiveSmoothScroll.js';

// 2. 初期化コードのコメントアウトを外す
new ResponsiveSmoothScroll({
  debug: false // 開発時はtrueに変更
});
```

#### HTML例:
```html
<a href="#section1">セクション1へ</a>
<div id="section1">コンテンツ</div>
```

---

## ユーティリティ機能

### 🚀 debounce（デバウンス）

#### こんな時に有効化:
- リサイズイベントの最適化が必要
- 検索入力の遅延処理を実装したい
- パフォーマンスの改善が必要

#### 有効化方法:
```javascript
// 1. インポート文のコメントアウトを外す
import { debounce } from './utils/debounce.js';

// 2. ハンドラー作成とイベントリスナー登録のコメントアウトを外す
const handleResize = debounce(() => {
  // リサイズ時の処理
}, 250);

window.addEventListener('resize', handleResize);
```

### ⚡ throttle（スロットル）

#### こんな時に有効化:
- スクロールイベントの頻度制限が必要
- マウス移動やアニメーションの最適化
- 高頻度イベントのパフォーマンス改善

#### 有効化方法:
```javascript
import { throttle } from './utils/throttle.js';

const scrollHandler = throttle(() => {
  // スクロール処理
}, 100);

window.addEventListener('scroll', scrollHandler);
```

### 🔧 DOM Helpers

#### こんな時に有効化:
- 安全なDOM操作が必要
- 要素の可視性チェックを行いたい
- エラーハンドリング付きのセレクタ実行

#### 有効化方法:
```javascript
import { isElementInViewport, addClass, removeClass } from './utils/dom-helpers.js';
```

---

## 実践的な組み合わせ例

### 📱 LP（ランディングページ）の場合
```javascript
// YouTube動画とスムーススクロールを有効化
import LazyYouTubeLoader from './modules/lazy-youtube-loader/LazyYouTubeLoader.js';
import ResponsiveSmoothScroll from './modules/responsive-smooth-scroll/ResponsiveSmoothScroll.js';

function initializeApp() {
  new LazyYouTubeLoader({ debug: false });
  new ResponsiveSmoothScroll({ debug: false });
}
```

### 🏢 企業サイトの場合
```javascript
// 地図とスムーススクロールを有効化
import LazyGoogleMapLoader from './modules/lazy-google-map-loader/LazyGoogleMapLoader.js';
import ResponsiveSmoothScroll from './modules/responsive-smooth-scroll/ResponsiveSmoothScroll.js';

function initializeApp() {
  new LazyGoogleMapLoader({ debug: false });
  new ResponsiveSmoothScroll({ debug: false });
}
```

### 📄 コンテンツサイトの場合
```javascript
// すべての機能を有効化
import LazyYouTubeLoader from './modules/lazy-youtube-loader/LazyYouTubeLoader.js';
import LazyGoogleMapLoader from './modules/lazy-google-map-loader/LazyGoogleMapLoader.js';
import ResponsiveSmoothScroll from './modules/responsive-smooth-scroll/ResponsiveSmoothScroll.js';
import { debounce } from './utils/debounce.js';

function initializeApp() {
  new LazyYouTubeLoader({ debug: false });
  new LazyGoogleMapLoader({ debug: false });
  new ResponsiveSmoothScroll({ debug: false });
}

const handleResize = debounce(() => {
  // カスタムリサイズ処理
}, 250);

window.addEventListener('resize', handleResize);
```

### 🎯 シンプルサイトの場合
```javascript
// 最小限の機能のみ
import ResponsiveSmoothScroll from './modules/responsive-smooth-scroll/ResponsiveSmoothScroll.js';

function initializeApp() {
  new ResponsiveSmoothScroll({ debug: false });
}
```

---

## デバッグモードの使い方

開発中は各機能の`debug`オプションを`true`に設定することで、詳細なログが出力されます。

```javascript
new LazyYouTubeLoader({
  debug: true // 開発時はtrue、本番環境ではfalse
});
```

### デバッグログ例:
```
[LazyYouTubeLoader] 3個のYouTube動画要素を検出しました
[LazyYouTubeLoader] YouTube動画(ID: dQw4w9WgXcQ)を読み込みました。(1/3)
```

---

## パフォーマンスの考慮事項

### バンドルサイズの最適化
- 使用しない機能はコメントアウトのままにする
- ビルドツールが未使用コードを自動除去
- 必要最小限の機能のみを有効化

### 読み込み順序
1. 必須機能（スムーススクロールなど）
2. メディア関連（YouTube、Google Map）
3. ユーティリティ（debounce、throttleなど）

### 機能の依存関係
- 各機能は独立しているため、どの組み合わせでも使用可能
- ユーティリティ関数は他の機能から使用される場合がある

---

## トラブルシューティング

### よくある問題

**機能が動作しない場合:**
1. インポート文のコメントアウトが外されているか確認
2. 初期化コードのコメントアウトが外されているか確認
3. HTML要素に正しいクラス名が設定されているか確認

**パフォーマンスが悪い場合:**
1. 不要な機能をコメントアウト
2. デバッグモードを無効化
3. 適切なthreshold値の設定

**エラーが発生する場合:**
1. ブラウザのコンソールでエラーメッセージを確認
2. デバッグモードを有効化して詳細ログを確認
3. 各モジュールのREADME.mdを参照