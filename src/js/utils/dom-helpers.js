/**
 * dom-helpers.js - DOM操作ヘルパー関数集
 * 
 * 安全で効率的なDOM操作のためのユーティリティ関数を提供。
 * エラーハンドリングと型チェックを含む堅牢なDOM操作を実現。
 * 
 * 使用例:
 * ```javascript
 * import { 
 *   isElementInViewport, 
 *   addClass, 
 *   removeClass,
 *   querySelector,
 *   querySelectorAll 
 * } from './utils/dom-helpers.js';
 * 
 * // 要素の可視性チェック
 * const element = querySelector('.my-element');
 * if (isElementInViewport(element)) {
 *   addClass(element, 'visible');
 * }
 * 
 * // 安全なセレクタ実行
 * const items = querySelectorAll('.invalid-selector?');
 * // エラーが発生しても空配列が返される
 * ```
 */

/**
 * 要素が画面内に表示されているかチェック
 * @param {HTMLElement} element - チェックする要素
 * @returns {boolean} 画面内に表示されているかどうか
 */
export function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 要素にクラスを安全に追加
 * @param {HTMLElement} element - 対象要素
 * @param {string} className - 追加するクラス名
 */
export function addClass(element, className) {
  if (element && className) {
    element.classList.add(className);
  }
}

/**
 * 要素からクラスを安全に削除
 * @param {HTMLElement} element - 対象要素
 * @param {string} className - 削除するクラス名
 */
export function removeClass(element, className) {
  if (element && className) {
    element.classList.remove(className);
  }
}

/**
 * セレクタで要素を安全に取得
 * @param {string} selector - CSSセレクタ
 * @param {Document|Element} context - 検索コンテキスト
 * @returns {HTMLElement|null} 見つかった要素
 */
export function querySelector(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return null;
  }
}

/**
 * セレクタで複数の要素を安全に取得
 * @param {string} selector - CSSセレクタ
 * @param {Document|Element} context - 検索コンテキスト
 * @returns {NodeList} 見つかった要素のリスト
 */
export function querySelectorAll(selector, context = document) {
  try {
    return context.querySelectorAll(selector);
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return [];
  }
}