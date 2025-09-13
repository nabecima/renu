# Image Processor

画像のリサイズ・分割・レスポンシブHTMLタグ生成を行うツール

## 機能

- 画像のリサイズ（PC/SP両対応）
- 画像の縦方向分割
- レスポンシブ対応のHTMLタグ生成（pictureタグ）
- 生成されたHTMLタグのクリップボードへの自動コピー

## 使用方法

### 基本的な使用方法

```bash
cd tools
python3 image_processor.py [画像パス] [オプション]
```

### 相対パスでの使用（推奨）

```bash
# toolsディレクトリから実行
cd tools

# src/images/pc/fv/base.jpgを処理
python3 image_processor.py ../src/images/pc/fv/base.jpg

# 設定ファイルを使用
python3 image_processor.py ../src/images/pc/fv/base.jpg --config image_processor_config.json
```

## コマンドライン引数

### 必須引数
- `image_path`: 処理するPC用画像のパス（相対パス・絶対パス両方可）

### オプション引数

#### リサイズ関連
- `--width`: 目標横幅を指定
- `--scale`: 倍率を指定（デフォルト: 2.0）
- `--sp-width`: SP画像の目標横幅（PC画像の場合のみ）
- `--sp-scale`: SP画像の倍率（PC画像の場合のみ、デフォルト: 2.0）

#### 出力関連
- `--media`: pictureタグのsourceのmedia属性（デフォルト: `(max-width: 750px)`）
- `--config`: 設定ファイルのパス（JSON形式）

## 設定ファイル

`image_processor_config.json` で設定を管理できます。

### 設定例

```json
{
  "width": 4000,
  "scale": 2.0,
  "sp_width": 1500,
  "sp_scale": 2.0,
  "media": "(max-width: 1000px)"
}
```

### 優先順位

設定ファイルの値がコマンドライン引数より優先されます。

## 依存関係

```bash
pip install -r requirements.txt
```

## 使用例

### 基本的な使用

```bash
cd tools
python3 image_processor.py ../src/images/pc/fv/base.jpg --width 4000
```

### 設定ファイルを使用

```bash
cd tools
python3 image_processor.py ../src/images/pc/fv/base.jpg --config image_processor_config.json
```

### カスタムメディアクエリ

```bash
cd tools
python3 image_processor.py ../src/images/pc/fv/base.jpg --media "(max-width: 768px)"
```

## 処理結果

1. **分割画像の保存**: 元画像と同じディレクトリに `1.jpg`, `2.jpg`, ... として保存
2. **HTMLタグの生成**: レスポンシブ対応のpictureタグを生成
3. **クリップボードコピー**: 生成されたHTMLタグが自動的にクリップボードにコピー

## 注意事項

- **相対パスの使用を推奨**: `tools/` ディレクトリから `../src/images/pc/fv/base.jpg` のような相対パスで指定
- **PC/SP画像の対応**: PC画像のパスに `/pc/` が含まれる場合、対応するSP画像（`/sp/`）も自動処理
- **分割数の自動計算**: 画像の高さに基づいて分割数を自動決定（200pxごと）
- **ファイル形式**: 元画像の拡張子に応じて `.jpg` または `.png` で保存