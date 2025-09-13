/**
 * LazyGoogleMapLoader.js
 * Google Mapの埋め込みマップを遅延読み込みするクラス
 */
class LazyGoogleMapLoader {
  /**
   * コンストラクタ
   * @param {Object} options - 設定オプション
   * @param {string} options.selector - GoogleMap埋め込み要素のセレクタ
   * @param {string} options.placeholderClass - プレースホルダーのクラス名
   * @param {string} options.loadedClass - 読み込み完了後に追加するクラス名
   * @param {boolean} options.autoInit - 自動的に初期化するかどうか（デフォルト: true）
   * @param {Function} options.onLoad - マップ読み込み完了時に実行するコールバック関数
   * @param {boolean} options.debug - デバッグモード（コンソールログ出力）
   */
  constructor(options = {}) {
    // デフォルト設定とマージ
    this.config = {
      selector: ".js-lazy-map",
      placeholderClass: "lazy-map-placeholder",
      loadedClass: "lazy-map-loaded",
      autoInit: true,
      onLoad: null,
      debug: false,
      ...options
    };

    // 読み込み完了マップ数のカウンター
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
      this._log("IntersectionObserverがサポートされていません。すべてのマップを即時読み込みします。");
      this.loadAllMaps();
      return;
    }

    // IntersectionObserverを初期化
    this.observer = new IntersectionObserver(this.boundIntersectionHandler, this.observerOptions);

    // 対象要素を取得して監視を開始
    const elements = document.querySelectorAll(this.config.selector);
    this.totalCount = elements.length;

    if (this.totalCount === 0) {
      this._log("対象となるGoogle Map要素が見つかりません。");
      return;
    }

    this._log(`${this.totalCount}個のGoogle Map要素を検出しました`);

    elements.forEach((element) => {
      // プレースホルダークラスを追加
      element.classList.add(this.config.placeholderClass);

      // マップ情報を設定
      this.setupElement(element);

      // 要素を監視
      this.observer.observe(element);
    });

    // ウィンドウリサイズ時にrootMarginを更新（デバウンス付き）
    window.addEventListener("resize", this.boundResizeHandler);
  }

  /**
   * 要素を設定する
   * @param {HTMLElement} element - Google Map埋め込み要素
   */
  setupElement(element) {
    // data-map-src属性が既にある場合はスキップ
    if (element.dataset.mapSrc) return;

    // src属性またはdata-src属性からGoogle Map URLを取得
    const src = element.getAttribute("data-src") || element.getAttribute("src") || "";
    
    if (src) {
      // data-srcが指定されている場合はそのまま使用
      element.dataset.mapSrc = src;

      // src属性を削除してdata-src属性に移動（即時読み込みを防止）
      if (element.hasAttribute("src")) {
        element.setAttribute("data-src", src);
        element.removeAttribute("src");
      }
    } else {
      // data-srcが指定されていない場合は座標や住所からURLを生成
      const defaultMap = this.generateMapUrl(element);
      if (defaultMap) {
        element.dataset.mapSrc = defaultMap;
        // 生成したURLをdata-src属性にも設定
        element.setAttribute("data-src", defaultMap);
      } else {
        this._log(`警告: 要素からGoogle Map URLを取得できませんでした`);
      }
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
        this.loadMap(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }

  /**
   * データ属性からGoogle Map URLを生成する
   * @param {HTMLElement} element - 対象要素
   * @returns {string|null} - 生成されたGoogle Map URL
   */
  generateMapUrl(element) {
    // 座標情報を取得
    const lat = element.getAttribute("data-lat");
    const lng = element.getAttribute("data-lng");
    const zoom = element.getAttribute("data-zoom") || "14";
    const maptype = element.getAttribute("data-maptype") || "roadmap";
    
    // 住所情報を取得
    const address = element.getAttribute("data-address");
    const place = element.getAttribute("data-place");

    let query = "";
    
    if (lat && lng) {
      // 座標が指定されている場合
      query = `${lat},${lng}`;
    } else if (address) {
      // 住所が指定されている場合
      query = encodeURIComponent(address);
    } else if (place) {
      // 場所名が指定されている場合
      query = encodeURIComponent(place);
    } else {
      // デフォルト（東京駅）
      query = "35.6812,139.7671";
    }

    if (!query) return null;

    // Google Maps Embed URLを生成
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.747!2d${lng || '139.7671'}!3d${lat || '35.6812'}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sja!2sjp!4v1234567890123!5m2!1sja!2sjp&q=${query}&z=${zoom}&maptype=${maptype}`;
  }

  /**
   * マップを読み込む
   * @param {HTMLElement} element - Google Map埋め込み要素
   */
  loadMap(element) {
    const mapSrc = element.dataset.mapSrc;
    if (!mapSrc) {
      this._log(`警告: Google Map URLが見つかりません`);
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
        const iframe = this.createIframe(element, mapSrc);
        
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

      const mapId = element.id || `map-${this.loadedCount}`;
      this._log(`Google Map(ID: ${mapId})を読み込みました。(${this.loadedCount}/${this.totalCount})`);

      // すべてのマップ読み込みが完了したかチェック
      if (this.loadedCount === this.totalCount) {
        this._log(`すべてのGoogle Map(${this.totalCount}個)の読み込みが完了しました`);
      }

      // コールバックがあれば呼び出し
      this.executeCallback(element, mapId);
    } catch (error) {
      this._log(`エラー: マップ読み込み中にエラーが発生しました: ${error.message}`);
    }
  }

  /**
   * iframe要素を作成する
   * @param {HTMLElement} element - 親要素
   * @param {string} mapSrc - Google MapのURL
   * @returns {HTMLIFrameElement} - 作成されたiframe要素
   */
  createIframe(element, mapSrc) {
    const iframe = document.createElement("iframe");
    iframe.width = element.getAttribute("data-width") || "100%";
    iframe.height = element.getAttribute("data-height") || "400";
    iframe.src = mapSrc;
    iframe.setAttribute("frameborder", "0");
    iframe.style.border = "0";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
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
   * @param {string} mapId - Google Map ID
   */
  executeCallback(element, mapId) {
    if (typeof this.config.onLoad === "function") {
      try {
        this.config.onLoad({
          element: element,
          mapId: mapId,
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
   * すべてのマップを即時読み込む
   */
  loadAllMaps() {
    const elements = document.querySelectorAll(this.config.selector);
    this.totalCount = elements.length;

    this._log(`${this.totalCount}個のGoogleマップを即時読み込みします`);

    elements.forEach((element) => {
      this.loadMap(element);
    });
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
      console.log(`%c[LazyGoogleMapLoader] %c${message}`, "color: #4285F4; font-weight: bold", "color: #333");
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
    this._log("LazyGoogleMapLoaderインスタンスを破棄しました");
  }
}

export default LazyGoogleMapLoader;
