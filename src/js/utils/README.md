# Utils - ユーティリティ関数集

このディレクトリには、プロジェクト全体で再利用可能なユーティリティ関数が含まれています。

## 含まれるファイル

### debounce.js
イベント処理の最適化のためのデバウンス機能を提供します。

### throttle.js
イベント処理の最適化のためのスロットル機能を提供します。

### dom-helpers.js
安全で効率的なDOM操作のためのヘルパー関数集です。

## 使用方法

各ユーティリティは個別にインポートして使用できます：

```javascript
import { debounce } from './utils/debounce.js';
import { throttle } from './utils/throttle.js';
import { isElementInViewport, addClass } from './utils/dom-helpers.js';
```

## パフォーマンス最適化

これらのユーティリティは以下のパフォーマンス課題を解決します：

- **過度なイベント実行**: debounce/throttleで制限
- **不安全なDOM操作**: dom-helpersで安全性確保
- **メモリリーク**: 適切なイベントリスナー管理

詳細は各ファイルのドキュメントを参照してください。