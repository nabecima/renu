/**
 * レスポンシブ対応のスムーススクロール実装
 * 固定ヘッダーの高さが変化する場合に対応
 */

export class ResponsiveSmoothScroll {
  constructor(options = {}) {
    // デフォルト設定
    this.config = {
      duration: 800, // スクロール時間（ミリ秒）
      easing: "easeInOutCubic", // イージング関数
      offsetSelector: "header", // オフセット計算対象のセレクタ
      offset: 0, // 追加のオフセット値
      offsetPosition: "bottom", // 'bottom', 'top', 'center'
      selector: 'a[href^="#"]', // 対象とするセレクタ
      excludeSelector: null, // 除外するセレクタ
      updateOnResize: true, // リサイズ時に自動更新するか
      debounceTime: 250, // リサイズ時のデバウンス時間
      ...options
    };

    // イージング関数の定義
    this.easingFunctions = {
      linear: (t) => t,
      easeIn: (t) => t * t,
      easeOut: (t) => t * (2 - t),
      easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
      easeInCubic: (t) => t * t * t,
      easeOutCubic: (t) => --t * t * t + 1,
      easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)
    };

    // デバウンスタイマー
    this.resizeTimer = null;

    this.init();
  }

  init() {
    // イベントリスナーを設定
    document.addEventListener("click", this.handleClick.bind(this), { passive: false });

    // リサイズ時のリスナー設定
    if (this.config.updateOnResize) {
      window.addEventListener("resize", this.handleResize.bind(this));
    }
  }

  handleResize() {
    // デバウンス処理
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = setTimeout(() => {
      // リサイズ後の処理（必要に応じてオーバーライド可能）
    }, this.config.debounceTime);
  }

  handleClick(e) {
    const link = e.target.closest(this.config.selector);

    // リンク要素が見つからない場合
    if (!link) return;

    // 除外セレクタに該当する場合
    if (this.config.excludeSelector && link.matches(this.config.excludeSelector)) {
      return;
    }

    // href属性から対象要素を取得
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    // 対象要素が存在するか確認
    const targetElement = document.querySelector(href);
    if (!targetElement) return;

    // デフォルトのスクロールを防ぐ
    e.preventDefault();
    e.stopPropagation();

    // スムーススクロールを実行
    this.scrollTo(targetElement);
  }

  /**
   * 動的にオフセットを計算する
   * @returns {number} 計算されたオフセット値
   */
  getDynamicOffset() {
    // オフセットセレクタが指定されていない場合は固定値を返す
    if (!this.config.offsetSelector) {
      return this.config.offset;
    }

    // オフセット要素を取得
    const offsetElement = document.querySelector(this.config.offsetSelector);
    if (!offsetElement) {
      return this.config.offset;
    }

    // 要素の高さを取得
    const rect = offsetElement.getBoundingClientRect();
    let calculatedOffset = 0;

    // fixed要素の高さを取得
    if (this.config.offsetPosition === "bottom" || this.config.offsetPosition === "top") {
      calculatedOffset = rect.height;
    } else if (this.config.offsetPosition === "center") {
      calculatedOffset = rect.height / 2;
    }

    // 追加のオフセットを加算
    return calculatedOffset + this.config.offset;
  }

  scrollTo(targetElement) {
    const targetPosition = this.getTargetPosition(targetElement);
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    // ゼロ距離の場合は処理を終了
    if (Math.abs(distance) < 1) {
      this.onScrollComplete(targetElement);
      return;
    }

    // スクロールアニメーション
    const scroll = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / this.config.duration, 1);

      // イージング関数を適用
      const easing = this.easingFunctions[this.config.easing] || this.easingFunctions.easeInOutCubic;
      const easedProgress = easing(progress);

      // 新しいスクロール位置を計算
      window.scrollTo(0, startPosition + distance * easedProgress);

      // アニメーションが完了していない場合は続行
      if (progress < 1) {
        requestAnimationFrame(scroll);
      } else {
        // アニメーション完了時のコールバック
        this.onScrollComplete(targetElement);
      }
    };

    // アニメーション開始
    requestAnimationFrame(scroll);
  }

  getTargetPosition(targetElement) {
    const rect = targetElement.getBoundingClientRect();
    const dynamicOffset = this.getDynamicOffset();

    // ターゲット要素のページ上の絶対位置を計算
    let targetPosition = rect.top + window.pageYOffset - dynamicOffset;

    // ページの最下部を超えないように調整
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    targetPosition = Math.min(targetPosition, maxScroll);

    // 負の値にならないように調整
    targetPosition = Math.max(targetPosition, 0);

    return targetPosition;
  }

  onScrollComplete(targetElement) {
    // スクロール完了時の処理
    // URLハッシュを更新（ブラウザ履歴に残す）
    if (targetElement.id) {
      window.history.pushState(null, "", `#${targetElement.id}`);
    }

    // フォーカスを移動（アクセシビリティ向上）
    targetElement.focus({ preventScroll: true });
  }

  // 外部から手動でスクロールを実行するメソッド
  scrollToElement(selector) {
    const targetElement = document.querySelector(selector);
    if (targetElement) {
      this.scrollTo(targetElement);
    }
  }

  // 設定を更新するメソッド
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  // 現在のオフセット値を取得するメソッド
  getCurrentOffset() {
    return this.getDynamicOffset();
  }

  // イベントリスナーを削除するメソッド
  destroy() {
    document.removeEventListener("click", this.handleClick.bind(this));
    if (this.config.updateOnResize) {
      window.removeEventListener("resize", this.handleResize.bind(this));
    }
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
  }
}

// デフォルトエクスポート（シンプルな初期化）
export default ResponsiveSmoothScroll;
