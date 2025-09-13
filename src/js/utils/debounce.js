/**
 * debounce.js - デバウンス機能
 * 
 * 連続したイベント実行を制御し、最後の呼び出しから指定時間後に実行する。
 * 主にリサイズ、スクロール、入力イベントのパフォーマンス最適化に使用。
 * 
 * 使用例:
 * ```javascript
 * import { debounce } from './utils/debounce.js';
 * 
 * // 検索入力の遅延実行
 * const searchHandler = debounce((query) => {
 *   console.log('検索実行:', query);
 * }, 300);
 * 
 * inputElement.addEventListener('input', (e) => {
 *   searchHandler(e.target.value);
 * });
 * 
 * // ウィンドウリサイズの最適化
 * const resizeHandler = debounce(() => {
 *   console.log('リサイズ処理');
 * }, 250);
 * 
 * window.addEventListener('resize', resizeHandler);
 * ```
 */

/**
 * デバウンス関数
 * 連続した呼び出しを指定した遅延時間だけ待機してから実行する
 * 
 * @param {Function} func - 実行する関数
 * @param {number} delay - 遅延時間（ミリ秒）
 * @returns {Function} デバウンスされた関数
 * 
 * @example
 * const debouncedFunction = debounce(() => {
 *   console.log('実行されました');
 * }, 1000);
 * 
 * // 1秒以内に複数回呼び出しても、最後の1回のみ実行される
 * debouncedFunction();
 * debouncedFunction();
 * debouncedFunction(); // この呼び出しのみが1秒後に実行される
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export default debounce;