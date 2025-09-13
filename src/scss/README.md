# SCSS アーキテクチャ・機能説明

このプロジェクトのSCSSは、スライスした画像からのコーディングに最適化されたFLOCSS（Foundation Layout Object Component State）アーキテクチャを採用しています。

## 📁 ディレクトリ構造

```
src/scss/
├── foundation/           # 基盤となるスタイル
│   ├── _variables.scss   # 変数定義
│   ├── _functions.scss   # 関数定義
│   ├── _mixins.scss      # ミックスイン定義
│   ├── _base.scss        # ベーススタイル
│   └── _index.scss       # foundationのインデックス
├── layout/               # レイアウト関連
│   ├── _main.scss        # メインレイアウト
│   └── _index.scss       # layoutのインデックス
├── object/               # オブジェクト（コンポーネント）
│   ├── component/        # 再利用可能なコンポーネント
│   │   ├── _image.scss   # 画像コンポーネント
│   │   └── _index.scss   # componentのインデックス
│   ├── project/          # プロジェクト固有のコンポーネント
│   │   ├── _fv.scss      # ファーストビュー
│   │   ├── _a.scss       # アンカーリンク
│   │   └── _index.scss   # projectのインデックス
│   └── _index.scss       # objectのインデックス
├── utility/              # ユーティリティクラス
│   └── _index.scss       # utilityのインデックス
└── style.scss            # メインのSCSSファイル
```

## 🔧 主要機能

### 1. レスポンシブ対応システム

#### ブレークポイント設定
```scss
$breakpoints: (
  sm: 1000px,
  content: 1100px,
  lg: 2000px,
);
```

#### コンテナクエリ対応
- モダンブラウザ向けのコンテナクエリ
- 従来のメディアクエリをフォールバックとして併用
- 自動的にサポート状況を判定して最適な方法を選択

### 2. 単位変換関数

#### ピクセル → vw/cqw変換
```scss
// 750px基準でvw変換
@function to-vw($px-value, $base-width: 750px, $max-value: null)

// 750px基準でcqw変換（コンテナクエリ用）
@function to-cqw($px-value, $base-width: 750px, $max-value: null)
```

#### 数値抽出
```scss
// ピクセル値から数値のみを取得
@function strip-unit($value)
```

### 3. レスポンシブ用ミックスイン

#### メディアクエリ
```scss
// 基本的なメディアクエリ
@include mq(sm);      // max-width: 1000px
@include mq(sm, min); // min-width: 1001px
```

#### コンテナクエリ
```scss
// コンテナクエリ（コンテナ名指定可能）
@include cq(sm);                    // 基本使用
@include cq(sm, max, "container");  // コンテナ名指定
```

#### レスポンシブ値設定（重要機能）
```scss
// プロパティに対してレスポンシブ値を自動設定
@include responsive-value(font-size, 24px, 750px, 32px);
```

## 🎯 responsive-value詳細解説

### 基本概念
`responsive-value`は、スライス画像コーディングにおいて**デザインカンプの比率を維持**しながら、異なるデバイスサイズに対応するための核となる機能です。

### パラメータ詳細
```scss
@mixin responsive-value(
  $property,     // 設定するCSSプロパティ名
  $px-value,     // デザインカンプでの基準値（px）
  $base-width: 750px,  // デザインカンプの基準幅
  $max-value: null     // 最大値制限（オプション）
)
```

### 動作フローチャート
```
1. コンテナクエリ対応ブラウザの判定
   ↓
2-A. 対応ブラウザの場合
   ├─ 基準幅未満: cqw（コンテナ幅）で比例計算
   ├─ 基準幅以上lg未満: 固定値
   └─ lg以上: lg基準の比例計算
   
2-B. 非対応ブラウザの場合
   ├─ 基準幅未満: vw（ビューポート幅）で比例計算
   ├─ 基準幅以上lg未満: 固定値
   └─ lg以上: lg基準の比例計算
```

### 実際の計算例

#### 例1: 基本的な使用
```scss
// デザインカンプ：750px幅で要素の高さが100px
.element {
  @include responsive-value(height, 100px, 750px);
}
```

**生成されるCSS:**
```css
.element {
  /* コンテナクエリ対応ブラウザ */
  height: calc(100 * 100cqw / 750);  /* 13.33cqw */
  
  /* 750px以上 */
  @container (min-width: 751px) {
    height: 100px;
  }
  
  /* 2000px以上（lg） */
  @container (min-width: 2000px) {
    height: calc(100 * 100cqw / 2000);  /* 5cqw */
  }
}

/* フォールバック */
@supports not (container-type: inline-size) {
  .element {
    height: calc(100 * 100vw / 750);  /* 13.33vw */
    
    @media (min-width: 751px) {
      height: 100px;
    }
    
    @media (min-width: 2000px) {
      height: calc(100 * 100vw / 2000);  /* 5vw */
    }
  }
}
```

#### 例2: 最大値制限付き
```scss
// フォントサイズに最大値制限を設定
.title {
  @include responsive-value(font-size, 32px, 750px, 48px);
}
```

**結果:**
- 画面幅が小さい時：比例縮小
- 画面幅が大きい時：最大48pxで制限

### 使用シーン別パターン

#### パターン1: 画像の高さ調整
```scss
// スライス画像の高さをデザインカンプ比率で維持
.hero-image {
  @include responsive-value(height, 400px);
  // 750px基準で400px → 他のサイズでも比率維持
}
```

#### パターン2: 余白の調整
```scss
// セクション間の余白をレスポンシブ対応
.section {
  @include responsive-value(margin-bottom, 80px);
  @include responsive-value(padding-top, 60px);
}
```

#### パターン3: 複数プロパティの一括設定
```scss
// 複数のプロパティを同時に調整
.card {
  @include responsive-value(width, 300px);
  @include responsive-value(height, 200px);
  @include responsive-value(padding, 20px);
  @include responsive-value(border-radius, 8px);
}
```

### デバイス別の動作確認

#### 360px幅のスマートフォン
```scss
// 100px指定の場合
height: calc(100 * 100cqw / 750);  // 約48px (100 * 360 / 750)
```

#### 750px幅のタブレット
```scss
// 100px指定の場合
height: 100px;  // 固定値
```

#### 1200px幅のデスクトップ
```scss
// 100px指定の場合
height: 100px;  // 固定値（lg未満）
```

#### 2400px幅の大型ディスプレイ
```scss
// 100px指定の場合
height: calc(100 * 100cqw / 2000);  // 約120px (100 * 2400 / 2000)
```

### 注意事項とベストプラクティス

#### ✅ 推奨される使用法
```scss
// 1. 基本的な使用（デフォルト基準幅）
@include responsive-value(height, 200px);

// 2. 異なる基準幅での使用
@include responsive-value(font-size, 24px, 1200px);

// 3. 最大値制限付き
@include responsive-value(padding, 40px, 750px, 80px);
```

#### ❌ 避けるべき使用法
```scss
// 1. 極端に小さい値（精度の問題）
@include responsive-value(border-width, 1px);  // 避ける

// 2. 固定値が適切なプロパティ
@include responsive-value(z-index, 100);  // 避ける
```

### パフォーマンス考慮事項

1. **計算コスト**: ブラウザでの計算が必要
2. **再描画**: サイズ変更時の再計算
3. **最適化**: 不要な場所では固定値を使用

### トラブルシューティング

#### 問題: 値が期待通りにならない
```scss
// 解決: 基準幅を確認
@include responsive-value(height, 100px, 750px);  // 750px基準
@include responsive-value(height, 100px, 1200px); // 1200px基準
```

#### 問題: 大画面で値が大きくなりすぎる
```scss
// 解決: 最大値制限を設定
@include responsive-value(font-size, 32px, 750px, 48px);
```

### 実践的な組み合わせ例

```scss
// ヒーローセクション全体のレスポンシブ設定
.hero {
  @include responsive-value(height, 600px);
  @include responsive-value(padding-top, 80px);
  
  &__title {
    @include responsive-value(font-size, 48px, 750px, 64px);
    @include responsive-value(margin-bottom, 32px);
  }
  
  &__image {
    @include responsive-value(height, 400px);
    @include responsive-value(border-radius, 12px);
  }
}
```

このように、`responsive-value`はスライス画像コーディングにおいて、デザインカンプの比率を保ちながら全デバイスで一貫した見た目を実現する重要な機能です。

### 4. 画像最適化

#### 画像基本スタイル
```scss
@include img-base;
```
- `display: block`
- `width: 100%`
- `object-fit: cover`
- ユーザー操作無効化（ドラッグ、選択など）

#### レスポンシブ高さ調整
```scss
@include responsive-height(--h);
```
- CSS変数を使用した高さ調整
- コンテナクエリとメディアクエリの自動切り替え

### 5. スライス画像コーディング特化機能

#### 精密なマージン調整
```scss
@include responsive-margin();
```
- スライス画像の隙間調整に最適化
- デバイスサイズに応じた自動調整

#### 計算ベースの値設定
```scss
@include container-calc(height, var(--h), content, 100cqw);
```
- コンテナサイズに基づいた値計算
- 複数デバイスでの一貫性保証

## 🎯 使用例

### 基本的なコンポーネント作成
```scss
.c-hero {
  @include responsive-height(--hero-height);
  @include responsive-margin();
  
  &__image {
    @include img-base;
    @include responsive-value(height, 400px, 750px);
  }
}
```

### プロジェクト固有のスタイル
```scss
.p-fv {
  @include responsive-value(padding-top, 80px);
  
  @include mq(sm) {
    @include responsive-value(padding-top, 40px);
  }
}
```

## 🔍 デバッグ・保守

### 変数確認
- `$breakpoints`: ブレークポイント一覧
- `$container-breakpoints`: コンテナクエリ用ブレークポイント
- `$container-names`: コンテナ名定義

### 関数テスト
```scss
// ブレークポイント存在確認
@if has-breakpoint(sm) { /* 処理 */ }

// コンテナブレークポイント確認
@if has-container-breakpoint(content) { /* 処理 */ }
```

## 📝 命名規則

- Foundation: 変数、関数、mixinなどの基盤
- Layout: `l-` プレフィックス
- Component: `c-` プレフィックス（再利用可能）
- Project: `p-` プレフィックス（プロジェクト固有）
- Utility: `u-` プレフィックス

## 🚀 最適化のポイント

1. **モダンブラウザ対応**: コンテナクエリを優先使用
2. **レガシーブラウザ対応**: メディアクエリを自動フォールバック
3. **パフォーマンス**: 不要な計算を避ける条件分岐
4. **保守性**: 変数・関数による一元管理
5. **スケーラビリティ**: コンポーネント指向の設計

このアーキテクチャにより、スライス画像からの効率的なコーディングと、複数デバイスでの一貫したレイアウト実現が可能です。