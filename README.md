# LP制作特化Gulpテンプレート

## セットアップ手順

### 1. セットアップスクリプトの実行

```bash
./setup.sh
```

セットアップスクリプトを実行すると、以下の手順が自動実行されます：

1. **Gitリポジトリの初期化**
   - 既存のGitリポジトリがある場合、削除するかどうかを選択
   - 新しいGitリポジトリを初期化

2. **LPタイプの選択**
   - `1) SPのみ` - スマートフォン専用LP
   - `2) PC+SP` - PC・スマートフォン両対応LP

3. **フォルダ構造の自動作成**
   - **SPのみの場合**: `src/images/` 直下に `fv`、`a1`～`a10` フォルダを作成
   - **PC+SPの場合**: `src/images/pc/` と `src/images/sp/` 内にそれぞれ `fv`、`a1`～`a10` フォルダを作成

4. **環境のセットアップ**
   - Python仮想環境の作成
   - 依存関係のインストール（npm、pip）

### 2. 画像処理ツールの設定

`tools/image_processor_config.json` を編集して、画像処理の設定を変更します：

```json
{
  "width": 4000,
  "scale": 2.0,
  "sp_width": 1500,
  "sp_scale": 2.0,
  "media": "(max-width: 750px)"
}
```

**設定項目の説明：**
- `width`: PC画像の幅（px）
- `scale`: PC画像のスケール倍率
- `sp_width`: SP画像の幅（px）
- `sp_scale`: SP画像のスケール倍率
- `media`: SP用メディアクエリ

**画像処理ツールの使用方法：**
```bash
# 仮想環境をアクティベート
source myenv/bin/activate

# 画像処理を実行
cd tools
python image_processor.py ../src/images/pc/fv/base.jpg
```

### 3. SCSS変数の設定

`src/scss/foundation/_variables.scss` を編集して、ブレークポイントを設定します：

```scss
// ブレークポイント設定
$breakpoints: (
  sm: 750px,
  content: 1100px,
  lg: 2000px,
);

// コンテナクエリ用ブレークポイント
$container-breakpoints: (
  sm: 750px,
  content: 1100px,
  lg: 2000px,
);
```

**設定項目の説明：**
- `sm`: スマートフォン用ブレークポイント
- `content`: コンテンツ幅の基準
- `lg`: 大画面用ブレークポイント

プロジェクトに応じてこれらの値を調整してください。

## 開発開始

設定完了後、以下のコマンドで開発を開始できます：

```bash
# 開発サーバーを起動（BrowserSync、ポート3000）
npm run serve

# 開発ビルド
npm run dev

# 本番ビルド
npm run build
```

## プライバシーポリシーページの制御

プライバシーポリシーページ（`privacy-policy/index.html`）とその専用CSS（`privacy-policy.css`）の出力をコマンドオプションで制御できます。

```bash
# プライバシーポリシーページ（HTML+CSS）を出力する（デフォルト）
npm run build
npm run dev

# プライバシーポリシーページ（HTML+CSS）を出力しない
npm run build -- --no-privacy-policy
npm run dev -- --no-privacy-policy
```

### 使い分け例

- **LPのみ納品する場合**：`npm run build -- --no-privacy-policy`
- **LP+プライバシーポリシー納品する場合**：`npm run build`（デフォルト）