# LazyGoogleMapLoader.js

## 概要
LazyGoogleMapLoaderは、Google Mapの埋め込みマップを遅延読み込みするためのES6クラスです。Intersection Observer APIを使用して、ユーザーがスクロールしてマップが画面に表示される直前にマップを読み込むことで、初期ページ読み込み速度を向上させます。

## 主な機能
- **遅延読み込み**: Intersection Observer APIを使用した効率的なマップ読み込み
- **iframe埋め込み**: Google Maps Embed APIを使用したAPIキー不要の実装
- **自動URL生成**: 座標や住所からGoogle Maps埋め込みURLを自動生成
- **エラーハンドリング**: 堅牢なエラー処理とログ出力
- **メモリ効率**: 適切なイベントリスナーの管理とメモリリーク防止
- **柔軟な設定**: カスタマイズ可能なセレクタ、クラス名、コールバック関数

## 使用方法

### 基本的な使用
```javascript
// 自動初期化（推奨）
const loader = new LazyGoogleMapLoader();

// 手動初期化
const loader = new LazyGoogleMapLoader({
  autoInit: false
});
loader.init();
```

### 詳細設定
```javascript
const loader = new LazyGoogleMapLoader({
  selector: '.custom-map-selector',
  placeholderClass: 'my-map-placeholder',
  loadedClass: 'my-map-loaded',
  debug: true,
  onLoad: (data) => {
    console.log(`マップ読み込み完了: ${data.mapId}`);
    console.log(`進捗: ${data.loadedCount}/${data.totalCount}`);
  }
});
```

## 設定オプション

| オプション | 型 | デフォルト値 | 説明 |
|-----------|---|-------------|------|
| `selector` | string | `.js-lazy-map` | Google Map埋め込み要素のセレクタ |
| `placeholderClass` | string | `lazy-map-placeholder` | プレースホルダー用のクラス名 |
| `loadedClass` | string | `lazy-map-loaded` | 読み込み完了後に追加するクラス名 |
| `autoInit` | boolean | `true` | 自動的に初期化するかどうか |
| `onLoad` | function | `null` | マップ読み込み完了時のコールバック関数 |
| `debug` | boolean | `false` | デバッグモード（コンソールログ出力） |

## HTML構造例

### iframe要素の場合
```html
<iframe 
  class="js-lazy-map" 
  data-src="https://www.google.com/maps/embed?pb=!1m18!1m12..."
  data-width="100%" 
  data-height="400">
</iframe>
```

### div要素の場合

#### data-src属性で直接URL指定
```html
<div 
  class="js-lazy-map" 
  data-src="https://www.google.com/maps/embed?pb=!1m18!1m12..."
  data-width="100%" 
  data-height="400">
  <!-- プレースホルダー画像やテキストをここに配置 -->
</div>
```

#### 自動URL生成（座標、住所、場所名から）
```html
<!-- 座標指定 -->
<div 
  class="js-lazy-map" 
  data-lat="35.6812" 
  data-lng="139.7671"
  data-zoom="15"
  data-width="100%" 
  data-height="400">
  <!-- プレースホルダー画像やテキストをここに配置 -->
</div>

<!-- 住所指定 -->
<div 
  class="js-lazy-map" 
  data-address="東京都港区芝公園4-2-8"
  data-zoom="16"
  data-width="100%" 
  data-height="400">
</div>

<!-- 場所名指定 -->
<div 
  class="js-lazy-map" 
  data-place="東京タワー"
  data-zoom="14"
  data-width="100%" 
  data-height="400">
</div>
```

## CSS例
```css
.js-lazy-map {
  position: relative;
  background-color: #f5f5f5;
  min-height: 400px;
}

.lazy-map-placeholder {
  /* プレースホルダー状態のスタイル */
  opacity: 0.7;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z' fill='%23888'/%3E%3C/svg%3E");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 48px;
}

.lazy-map-loaded {
  /* 読み込み完了後のスタイル */
  opacity: 1;
}
```

## APIリファレンス

### コンストラクタ
```javascript
new LazyGoogleMapLoader(options)
```

### メソッド

#### `init()`
手動で初期化を実行します。
```javascript
loader.init();
```

#### `loadAllMaps()`
すべてのマップを即座に読み込みます（フォールバック用）。
```javascript
loader.loadAllMaps();
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
  mapId: string,           // Google Map ID
  loadedCount: number,     // 読み込み完了数
  totalCount: number,      // 総マップ数
  isComplete: boolean      // 全マップ読み込み完了フラグ
}
```

## 最適化機能

### メモリ効率
- イベントリスナーの適切な管理
- IntersectionObserverの自動切断
- デバウンス処理によるリサイズイベントの最適化

### パフォーマンス
- 動的なrootMarginの調整
- 効率的なマップURL生成
- 最小限のDOM操作

### エラーハンドリング
- 堅牢なエラー処理
- 詳細なログ出力（デバッグモード）
- フォールバック機能

## 対応データ属性

以下のデータ属性に対応しています：

### 直接URL指定
- `data-src`: Google Maps埋め込みURL（YouTubeと同様の使用方法）

### 座標指定（自動URL生成）
- `data-lat`: 緯度
- `data-lng`: 経度
- `data-zoom`: ズームレベル（デフォルト: 14）

### 住所・場所指定（自動URL生成）
- `data-address`: 住所（例: "東京都港区芝公園4-2-8"）
- `data-place`: 場所名（例: "東京タワー"）

### 表示設定
- `data-maptype`: マップタイプ（roadmap, satellite, hybrid, terrain）
- `data-width`: iframe幅（デフォルト: 100%）
- `data-height`: iframe高さ（デフォルト: 400）

### 使用優先順位
1. `data-src`が指定されている場合: そのURLを使用
2. `data-src`がない場合: 座標、住所、場所名から自動生成

## ブラウザサポート
- Intersection Observer API対応ブラウザ
- IE11以下の場合は自動的にフォールバックモードで動作

## 使用例（実装パターン）

### 基本的な実装
```javascript
// main.js
import LazyGoogleMapLoader from './LazyGoogleMapLoader.js';

document.addEventListener('DOMContentLoaded', () => {
  const mapLoader = new LazyGoogleMapLoader({
    debug: process.env.NODE_ENV === 'development'
  });
});
```

### 高度な実装（進捗表示付き）
```javascript
const loader = new LazyGoogleMapLoader({
  onLoad: (data) => {
    // 進捗表示
    const progress = (data.loadedCount / data.totalCount) * 100;
    document.getElementById('map-loading-progress').style.width = `${progress}%`;
    
    // 全マップ読み込み完了時
    if (data.isComplete) {
      document.getElementById('map-loading-indicator').style.display = 'none';
    }
  }
});
```

## 注意事項
- APIキーは不要（Google Maps Embed APIを使用）
- プレースホルダー画像やローディング表示は別途CSSで実装してください
- 大量のマップがある場合は、パフォーマンスを考慮してセクションごとに分割することを推奨します
- 座標、住所、場所名のいずれかを指定してください

## ライセンス
このクラスはプロジェクトのライセンスに従います。