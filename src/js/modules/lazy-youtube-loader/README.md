# LazyYouTubeLoader.js

## 概要
LazyYouTubeLoaderは、YouTubeの埋め込み動画を遅延読み込みするためのES6クラスです。Intersection Observer APIを使用して、ユーザーがスクロールして動画が画面に表示される直前に動画を読み込むことで、初期ページ読み込み速度を向上させます。

## 主な機能
- **遅延読み込み**: Intersection Observer APIを使用した効率的な動画読み込み
- **自動最適化**: デバイスの画面サイズに応じたrootMarginの動的調整
- **エラーハンドリング**: 堅牢なエラー処理とログ出力
- **メモリ効率**: 適切なイベントリスナーの管理とメモリリーク防止
- **柔軟な設定**: カスタマイズ可能なセレクタ、クラス名、コールバック関数

## 使用方法

### 基本的な使用
```javascript
// 自動初期化（推奨）
const loader = new LazyYouTubeLoader();

// 手動初期化
const loader = new LazyYouTubeLoader({
  autoInit: false
});
loader.init();
```

### 詳細設定
```javascript
const loader = new LazyYouTubeLoader({
  selector: '.custom-youtube-selector',
  placeholderClass: 'my-placeholder',
  loadedClass: 'my-loaded',
  debug: true,
  onLoad: (data) => {
    console.log(`動画読み込み完了: ${data.videoId}`);
    console.log(`進捗: ${data.loadedCount}/${data.totalCount}`);
  }
});
```

## 設定オプション

| オプション | 型 | デフォルト値 | 説明 |
|-----------|---|-------------|------|
| `selector` | string | `.js-lazy-youtube` | YouTube埋め込み要素のセレクタ |
| `placeholderClass` | string | `lazy-youtube-placeholder` | プレースホルダー用のクラス名 |
| `loadedClass` | string | `lazy-youtube-loaded` | 読み込み完了後に追加するクラス名 |
| `autoInit` | boolean | `true` | 自動的に初期化するかどうか |
| `onLoad` | function | `null` | 動画読み込み完了時のコールバック関数 |
| `debug` | boolean | `false` | デバッグモード（コンソールログ出力） |

## HTML構造例

### iframe要素の場合
```html
<iframe 
  class="js-lazy-youtube" 
  data-src="https://www.youtube.com/embed/VIDEO_ID"
  data-width="560" 
  data-height="315">
</iframe>
```

### div要素の場合
```html
<div 
  class="js-lazy-youtube" 
  data-src="https://www.youtube.com/embed/VIDEO_ID"
  data-width="560" 
  data-height="315">
  <!-- プレースホルダー画像やテキストをここに配置 -->
</div>
```

## CSS例
```css
.js-lazy-youtube {
  position: relative;
  background-color: #000;
  min-height: 315px;
}

.lazy-youtube-placeholder {
  /* プレースホルダー状態のスタイル */
  opacity: 0.7;
}

.lazy-youtube-loaded {
  /* 読み込み完了後のスタイル */
  opacity: 1;
}
```

## APIリファレンス

### コンストラクタ
```javascript
new LazyYouTubeLoader(options)
```

### メソッド

#### `init()`
手動で初期化を実行します。
```javascript
loader.init();
```

#### `loadAllVideos()`
すべての動画を即座に読み込みます（フォールバック用）。
```javascript
loader.loadAllVideos();
```

#### `destroy()`
インスタンスを破棄し、イベントリスナーを削除します。
```javascript
loader.destroy();
```

### コールバック関数
`onLoad`コールバック関数は以下の情報を含むオブジェクトを受け取ります：

```javascript
{
  element: HTMLElement,    // 読み込まれた要素
  videoId: string,         // YouTube動画ID
  loadedCount: number,     // 読み込み完了数
  totalCount: number,      // 総動画数
  isComplete: boolean      // 全動画読み込み完了フラグ
}
```

## 最適化機能

### メモリ効率
- イベントリスナーの適切な管理
- IntersectionObserverの自動切断
- デバウンス処理によるリサイズイベントの最適化

### パフォーマンス
- 動的なrootMarginの調整
- 効率的な動画ID抽出
- 最小限のDOM操作

### エラーハンドリング
- 堅牢なエラー処理
- 詳細なログ出力（デバッグモード）
- フォールバック機能

## 対応YouTube URL形式
以下の形式のYouTube URLに対応しています：
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `VIDEO_ID` (11文字のIDのみ)

## ブラウザサポート
- Intersection Observer API対応ブラウザ
- IE11以下の場合は自動的にフォールバックモードで動作

## 使用例（実装パターン）

### 基本的な実装
```javascript
// main.js
import LazyYouTubeLoader from './LazyYouTubeLoader.js';

document.addEventListener('DOMContentLoaded', () => {
  const youtubeLoader = new LazyYouTubeLoader({
    debug: process.env.NODE_ENV === 'development'
  });
});
```

### 高度な実装（進捗表示付き）
```javascript
const loader = new LazyYouTubeLoader({
  onLoad: (data) => {
    // 進捗表示
    const progress = (data.loadedCount / data.totalCount) * 100;
    document.getElementById('loading-progress').style.width = `${progress}%`;
    
    // 全動画読み込み完了時
    if (data.isComplete) {
      document.getElementById('loading-indicator').style.display = 'none';
    }
  }
});
```

## 注意事項
- `data-src`属性を使用してYouTube URLを指定してください
- プレースホルダー画像やローディング表示は別途CSSで実装してください
- 大量の動画がある場合は、パフォーマンスを考慮してセクションごとに分割することを推奨します

## ライセンス
このクラスはプロジェクトのライセンスに従います。