/**
 * LazyYouTubeLoader.js
 * YouTubeの埋め込み動画を遅延読み込みするクラス
 */
class LazyYouTubeLoader {
  /**
   * コンストラクタ
   * @param {Object} options - 設定オプション
   * @param {string} options.selector - YouTube埋め込み要素のセレクタ
   * @param {string} options.placeholderClass - プレースホルダーのクラス名
   * @param {string} options.loadedClass - 読み込み完了後に追加するクラス名
   * @param {boolean} options.autoInit - 自動的に初期化するかどうか（デフォルト: true）
   * @param {Function} options.onLoad - 動画読み込み完了時に実行するコールバック関数
   * @param {boolean} options.debug - デバッグモード（コンソールログ出力）
   */
  constructor(options = {}) {
    // デフォルト設定とマージ
    this.config = {
      selector: ".js-lazy-youtube",
      placeholderClass: "lazy-youtube-placeholder",
      loadedClass: "lazy-youtube-loaded",
      autoInit: true,
      onLoad: null,
      debug: false,
      ...options
    };

    // 読み込み完了動画数のカウンター
    this.loadedCount = 0;
    this.totalCount = 0;

    // IntersectionObserverのオプション - rootMarginをデバイスの高さ分に設定
    this.observerOptions = {
      rootMargin: `${window.innerHeight}px 0px`,
      threshold: 0.1
    };

    // IntersectionObserverインスタンス
    this.observer = null;

    // イベントリスナーの参照を保持（メモリリーク防止）
    this.boundResizeHandler = this.updateRootMargin.bind(this);
    this.boundIntersectionHandler = this.onIntersection.bind(this);

    // 自動初期化
    if (this.config.autoInit) {
      this.init();
    }
  }

  /**
   * 初期化メソッド
   */
  init() {
    // IntersectionObserverのサポートをチェック
    if (!("IntersectionObserver" in window)) {
      this._log("IntersectionObserverがサポートされていません。すべての動画を即時読み込みします。");
      this.loadAllVideos();
      return;
    }

    // IntersectionObserverを初期化
    this.observer = new IntersectionObserver(this.boundIntersectionHandler, this.observerOptions);

    // 対象要素を取得して監視を開始
    const elements = document.querySelectorAll(this.config.selector);
    this.totalCount = elements.length;

    if (this.totalCount === 0) {
      this._log("対象となるYouTube動画要素が見つかりません。");
      return;
    }

    this._log(`${this.totalCount}個のYouTube動画要素を検出しました`);

    elements.forEach((element) => {
      // プレースホルダークラスを追加
      element.classList.add(this.config.placeholderClass);

      // 動画IDを取得して属性に設定
      this.setupElement(element);

      // 要素を監視
      this.observer.observe(element);
    });

    // ウィンドウリサイズ時にrootMarginを更新（デバウンス付き）
    window.addEventListener("resize", this.boundResizeHandler);
  }

  /**
   * 要素を設定する
   * @param {HTMLElement} element - YouTube埋め込み要素
   */
  setupElement(element) {
    // data-youtube-id属性が既にある場合はスキップ
    if (element.dataset.youtubeId) return;

    // src属性またはdata-src属性からYouTube動画IDを抽出
    const src = element.getAttribute("data-src") || element.getAttribute("src") || "";
    const videoId = this.extractVideoId(src);

    if (videoId) {
      // 動画IDを属性に設定
      element.dataset.youtubeId = videoId;

      // src属性を削除してdata-src属性に移動（即時読み込みを防止）
      if (element.hasAttribute("src")) {
        element.setAttribute("data-src", src);
        element.removeAttribute("src");
      }
    } else {
      this._log(`警告: 要素からYouTube動画IDを取得できませんでした: ${src}`);
    }
  }

  /**
   * 交差検知のコールバック
   * @param {IntersectionObserverEntry[]} entries - 交差検知エントリー
   * @param {IntersectionObserver} observer - IntersectionObserverインスタンス
   */
  onIntersection(entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.loadVideo(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }

  /**
   * 動画を読み込む
   * @param {HTMLElement} element - YouTube埋め込み要素
   */
  loadVideo(element) {
    const videoId = element.dataset.youtubeId;
    if (!videoId) {
      this._log(`警告: YouTube動画IDが見つかりません`);
      return;
    }

    try {
      // iframeタグの場合
      if (element.tagName === "IFRAME") {
        const src = element.getAttribute("data-src");
        if (src) {
          element.setAttribute("src", src);
        }
      }
      // divなどの場合は直下にiframeを作成
      else {
        const iframe = this.createIframe(element, videoId);
        
        // 元のdivを保持したまま、その中にiframeを追加
        element.innerHTML = "";
        element.appendChild(iframe);

        // 親要素にクラスを適用
        this.updateElementClasses(element, this.config.loadedClass, this.config.placeholderClass);
      }

      // 読み込み完了クラスを追加
      element.classList.add(this.config.loadedClass);
      element.classList.remove(this.config.placeholderClass);

      // 読み込み完了カウンターを増やす
      this.loadedCount++;

      this._log(`YouTube動画(ID: ${videoId})を読み込みました。(${this.loadedCount}/${this.totalCount})`);

      // すべての動画読み込みが完了したかチェック
      if (this.loadedCount === this.totalCount) {
        this._log(`すべてのYouTube動画(${this.totalCount}個)の読み込みが完了しました`);
      }

      // コールバックがあれば呼び出し
      this.executeCallback(element, videoId);
    } catch (error) {
      this._log(`エラー: 動画読み込み中にエラーが発生しました: ${error.message}`);
    }
  }

  /**
   * すべての動画を即時読み込む
   */
  loadAllVideos() {
    const elements = document.querySelectorAll(this.config.selector);
    this.totalCount = elements.length;

    this._log(`${this.totalCount}個のYouTube動画を即時読み込みします`);

    elements.forEach((element) => {
      this.setupElement(element);
      this.loadVideo(element);
    });
  }

  /**
   * URL文字列からYouTube動画IDを抽出
   * @param {string} url - YouTube URL
   * @returns {string|null} - 動画ID
   */
  extractVideoId(url) {
    if (!url) return null;

    // YouTubeの動画IDを抽出するためのパターン
    const patterns = [/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i, /^([^"&?\/\s]{11})$/i];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * rootMarginを更新する（ウィンドウサイズ変更時）
   */
  updateRootMargin() {
    if (!this.observer) return;

    // デバウンス処理
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      // 既存のObserverを破棄
      this.observer.disconnect();

      // 新しいrootMarginで再初期化
      this.observerOptions.rootMargin = `${window.innerHeight}px 0px`;
      this.observer = new IntersectionObserver(this.boundIntersectionHandler, this.observerOptions);

      // 未読み込みの要素を再度監視
      const elements = document.querySelectorAll(`${this.config.selector}:not(.${this.config.loadedClass})`);
      elements.forEach((element) => {
        this.observer.observe(element);
      });

      this._log(`ウィンドウサイズ変更を検出: rootMarginを${this.observerOptions.rootMargin}に更新しました`);
    }, 100);
  }

  /**
   * デバッグログを出力
   * @param {string} message - ログメッセージ
   * @private
   */
  _log(message) {
    if (this.config.debug) {
      console.log(`%c[LazyYouTubeLoader] %c${message}`, "color: #ff0000; font-weight: bold", "color: #333");
    }
  }

  /**
   * iframe要素を作成する
   * @param {HTMLElement} element - 親要素
   * @param {string} videoId - YouTube動画ID
   * @returns {HTMLIFrameElement} - 作成されたiframe要素
   */
  createIframe(element, videoId) {
    const iframe = document.createElement("iframe");
    iframe.width = element.getAttribute("data-width") || "560";
    iframe.height = element.getAttribute("data-height") || "315";
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.setAttribute("frameborder", "0");
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    return iframe;
  }

  /**
   * 要素のクラスを更新する
   * @param {HTMLElement} element - 対象要素
   * @param {string} addClass - 追加するクラス
   * @param {string} removeClass - 削除するクラス
   */
  updateElementClasses(element, addClass, removeClass) {
    if (addClass) element.classList.add(addClass);
    if (removeClass) element.classList.remove(removeClass);
  }

  /**
   * コールバック関数を実行する
   * @param {HTMLElement} element - 対象要素
   * @param {string} videoId - YouTube動画ID
   */
  executeCallback(element, videoId) {
    if (typeof this.config.onLoad === "function") {
      try {
        this.config.onLoad({
          element: element,
          videoId: videoId,
          loadedCount: this.loadedCount,
          totalCount: this.totalCount,
          isComplete: this.loadedCount === this.totalCount
        });
      } catch (error) {
        this._log(`コールバック実行中にエラーが発生しました: ${error.message}`);
      }
    }
  }

  /**
   * 破棄処理
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }
    
    window.removeEventListener("resize", this.boundResizeHandler);
    this._log("LazyYouTubeLoaderインスタンスを破棄しました");
  }
}

export default LazyYouTubeLoader;
