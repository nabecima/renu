/**
 * throttle.js - スロットル機能
 * 
 * 関数の実行頻度を指定した間隔に制限する。
 * 主にスクロール、マウス移動、アニメーションなどの高頻度イベントの最適化に使用。
 * 
 * debounceとの違い:
 * - throttle: 指定間隔で定期的に実行
 * - debounce: 最後の呼び出しから指定時間後に実行
 * 
 * 使用例:
 * ```javascript
 * import { throttle } from './utils/throttle.js';
 * 
 * // スクロールイベントの最適化
 * const scrollHandler = throttle(() => {
 *   console.log('スクロール位置:', window.scrollY);
 * }, 100);
 * 
 * window.addEventListener('scroll', scrollHandler);
 * 
 * // ボタンの連打防止
 * const submitHandler = throttle(() => {
 *   console.log('フォーム送信');
 * }, 1000);
 * 
 * button.addEventListener('click', submitHandler);
 * ```
 */

/**
 * スロットル関数
 * 指定した間隔で関数の実行を制限する
 * 
 * @param {Function} func - 実行する関数
 * @param {number} limit - 実行間隔（ミリ秒）
 * @returns {Function} スロットルされた関数
 * 
 * @example
 * const throttledFunction = throttle(() => {
 *   console.log('実行されました');
 * }, 1000);
 * 
 * // 1秒間隔で実行される（間隔内の呼び出しは無視）
 * throttledFunction(); // 即座に実行
 * throttledFunction(); // 無視される
 * throttledFunction(); // 無視される
 * // 1秒後に再び実行可能になる
 */
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export default throttle;