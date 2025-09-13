/**
 * main.js - アプリケーションのエントリーポイント
 * 各モジュールを読み込み、初期化を行う
 *
 * 注意: このファイルはdeferで読み込まれるため、
 * DOMContentLoadedイベントは不要（DOMは既に解析済み）
 *
 * 使用方法:
 * 不要なモジュールはインポート文と初期化コードをコメントアウトしてください。
 * 例: YouTube機能が不要な場合は、該当行を // でコメントアウト
 */

// === モジュールのインポート ===
// 必要に応じてコメントアウトしてください

// YouTube遅延読み込み機能
// import LazyYouTubeLoader from './modules/lazy-youtube-loader/LazyYouTubeLoader.js';

// Google Map遅延読み込み機能
// import LazyGoogleMapLoader from './modules/lazy-google-map-loader/LazyGoogleMapLoader.js';

// レスポンシブスムーススクロール機能
// import ResponsiveSmoothScroll from './modules/responsive-smooth-scroll/ResponsiveSmoothScroll.js';

// === ユーティリティのインポート ===
// import { debounce } from './utils/debounce.js';
// import { throttle } from './utils/throttle.js';
// import { isElementInViewport, addClass, removeClass } from './utils/dom-helpers.js';

/**
 * アプリケーションの初期化
 * deferによりDOMが既に解析済みのため即座に実行可能
 *
 * 不要な機能はコメントアウトしてください
 */
// function initializeApp() {

// === YouTube遅延読み込みの初期化 ===
// YouTube動画の遅延読み込み機能が必要な場合のみ有効化
// new LazyYouTubeLoader({
//   debug: false // 開発時はtrueに変更
// });

// === Google Map遅延読み込みの初期化 ===
// Google Mapの遅延読み込み機能が必要な場合のみ有効化
// new LazyGoogleMapLoader({
//   debug: false // 開発時はtrueに変更
// });

// === スムーススクロールの初期化 ===
// スムーススクロール機能が必要な場合のみ有効化
// new ResponsiveSmoothScroll({
//   debug: false // 開発時はtrueに変更
// });

// }

// === イベントリスナーの設定 ===

// ウィンドウリサイズ時の処理（デバウンス適用）
// const handleResize = debounce(() => {
// 必要に応じてリサイズ時の処理を追加
// console.log('ウィンドウサイズが変更されました');
// }, 250);

// === カウントダウン機能 ===
function initCountdown() {
  const targetDate = new Date("2025-09-22T00:00:00").getTime();

  const saleElements = document.querySelectorAll(".sale");
  
  saleElements.forEach(saleEl => {
    const dayEl = saleEl.querySelector(".day");
    const hourEl = saleEl.querySelector(".hour");
    const minEl = saleEl.querySelector(".min");
    const secEl = saleEl.querySelector(".sec");

    if (!dayEl || !hourEl || !minEl || !secEl) return;

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        dayEl.textContent = "00";
        hourEl.textContent = "00";
        minEl.textContent = "00";
        secEl.textContent = "00";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      dayEl.textContent = days.toString().padStart(2, "0");
      hourEl.textContent = hours.toString().padStart(2, "0");
      minEl.textContent = minutes.toString().padStart(2, "0");
      secEl.textContent = seconds.toString().padStart(2, "0");
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  });
}

// === アプリケーション開始 ===

// deferで読み込まれるため、即座に初期化を実行
// initializeApp();
initCountdown();

// リサイズイベントリスナーの登録
// window.addEventListener('resize', handleResize);
