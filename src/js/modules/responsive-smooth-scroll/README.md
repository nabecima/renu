# ResponsiveSmoothScroll

レスポンシブ対応のスムーススクロール実装です。固定ヘッダーやナビゲーションの高さが画面サイズに応じて変化する場合に対応しています。

## 特徴

- 🎯 **動的オフセット計算**: ヘッダーやナビの現在の高さを自動で取得
- 📱 **レスポンシブ対応**: 画面サイズに応じた高さ変化に自動対応
- 🎨 **カスタマイズ可能**: スクロール時間、イージング、オフセットなどを細かく設定
- ♿ **アクセシビリティ対応**: スクロール後のフォーカス移動
- 🔄 **一貫性のある動作**: 同じリンクを複数回クリックしても同じ位置にスクロール
- 📚 **ES6モジュール**: インポート/エクスポート対応

## インストール

```jsx
// src/js/ResponsiveSmoothScroll.js を作成してコードをコピー
// main.js でインポート
import { ResponsiveSmoothScroll } from './ResponsiveSmoothScroll.js';

```

## 基本的な使用方法

```jsx
// デフォルト設定で初期化
const smoothScroll = new ResponsiveSmoothScroll();

// カスタム設定で初期化
const smoothScroll = new ResponsiveSmoothScroll({
  offsetSelector: 'header',
  offsetPosition: 'bottom',
  offset: 20
});

```

## 設定オプション

| オプション        | デフォルト値       | 説明                             |
| ----------------- | ------------------ | -------------------------------- |
| `duration`        | `800`              | スクロール時間（ミリ秒）         |
| `easing`          | `'easeInOutCubic'` | イージング関数                   |
| `offsetSelector`  | `'header'`         | オフセット計算対象の要素セレクタ |
| `offset`          | `0`                | 追加のオフセット値（px）         |
| `offsetPosition`  | `'bottom'`         | 要素のどの位置を基準にするか     |
| `selector`        | `'a[href^="#"]'`   | 対象とするリンクのセレクタ       |
| `excludeSelector` | `null`             | 除外するリンクのセレクタ         |
| `updateOnResize`  | `true`             | リサイズ時の自動更新             |
| `debounceTime`    | `250`              | リサイズ時のデバウンス時間       |

## イージング関数

利用可能なイージング関数：

- `linear`
- `easeIn`
- `easeOut`
- `easeInOut`
- `easeInCubic`
- `easeOutCubic`
- `easeInOutCubic`

## オフセット位置の指定

`offsetPosition` で要素のどの位置を基準にするかを指定：

- `'top'`: 要素の上端
- `'center'`: 要素の中央
- `'bottom'`: 要素の下端（固定ヘッダーに最適）

## メソッド

### scrollToElement(selector)

特定の要素にプログラムでスクロールします。

```jsx
smoothScroll.scrollToElement('#target-section');

```

### updateConfig(newConfig)

設定を動的に更新します。

```jsx
smoothScroll.updateConfig({
  duration: 1000,
  easing: 'easeOutCubic'
});

```

### getCurrentOffset()

現在のオフセット値を取得します。

```jsx
const offset = smoothScroll.getCurrentOffset();
console.log(`現在のオフセット: ${offset}px`);

```

### destroy()

イベントリスナーを削除します。

```jsx
smoothScroll.destroy();

```

## 使用例

### 固定ヘッダーとスティッキーナビゲーション

```jsx
const smoothScroll = new ResponsiveSmoothScroll({
  offsetSelector: '.main-header',
  offsetPosition: 'bottom',
  offset: 20,  // 20pxの追加マージン
  duration: 1000,
  easing: 'easeOutCubic'
});

```

### 複雑なレイアウト

```jsx
// 複数要素の高さを合計したオフセット
const smoothScroll = new ResponsiveSmoothScroll({
  offsetSelector: 'header',
  offsetPosition: 'bottom',
  offset: document.querySelector('.sticky-nav')?.offsetHeight || 0,
  duration: 800
});

```

### 特定のリンクを除外

```jsx
const smoothScroll = new ResponsiveSmoothScroll({
  selector: 'a[href^="#"]',
  excludeSelector: '.no-smooth, [data-no-smooth]'
});

```

### 初期化時のハッシュ対応

```jsx
document.addEventListener('DOMContentLoaded', () => {
  const smoothScroll = new ResponsiveSmoothScroll();

  // URLにハッシュがある場合
  if (window.location.hash) {
    setTimeout(() => {
      smoothScroll.scrollToElement(window.location.hash);
    }, 100);
  }
});

```

## HTML例

```html
<!-- 固定ヘッダー -->
<header class="main-header" style="position: fixed; top: 0;">
  <nav>ナビゲーション</nav>
</header>

<!-- スムーススクロールリンク -->
<nav class="page-nav">
  <a href="#section1">セクション1</a>
  <a href="#section2">セクション2</a>
  <a href="#external" class="no-smooth">外部リンク</a>
</nav>

<!-- 対象要素 -->
<section id="section1">
  <h2>セクション1</h2>
</section>

```

## CSS例

```css
/* 固定ヘッダー */
.main-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #333;
  z-index: 1000;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .main-header {
    height: 80px;
  }
}

```

## ブラウザサポート

- Chrome
- Firefox
- Safari
- Edge
- IE11+（トランスパイル必要）

## ライセンス

MIT License

## 貢献

バグ報告や機能提案は Issue または Pull Request でお願いします。

## 関連リンク

- [Intersection Observer API](https://developer.mozilla.org/ja/docs/Web/API/Intersection_Observer_API)
- [Scroll behavior](https://developer.mozilla.org/ja/docs/Web/CSS/scroll-behavior)
- [requestAnimationFrame](https://developer.mozilla.org/ja/docs/Web/API/Window/requestAnimationFrame)