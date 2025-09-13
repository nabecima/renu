/**
 * gulp/html-utils.js - HTML処理に特化したユーティリティ関数
 * HTML解析や変換に関連する機能を提供
 */

import path from "path";
import fs from "fs";
import prettier from "prettier";
import { paths, options, colors } from "./config.js";
import { log, readFileContent, removeExtraNewlines } from "./utils.js";

/**
 * スニペット設定ファイルを読み込む関数
 * @returns {Object|null} - スニペット設定、または失敗時はnull
 */
export function loadSnippetConfig() {
  const configPath = path.join(paths.html.snippets, "config.json");
  try {
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, { encoding: "utf8" });
      return JSON.parse(configContent);
    }
  } catch (error) {
    log("HTML", `スニペット設定の読み込みエラー: ${error.message}`, "error");
  }

  // デフォルト設定（設定ファイルがない場合）
  return {
    "head-snippet": { applyTo: ["index.html"], excludeFrom: [] },
    "body-snippet": { applyTo: ["index.html"], excludeFrom: [] },
  };
}

/**
 * ファイルパスがパターンにマッチするかを判定
 * @param {string} filePath - ファイルパス
 * @param {string} pattern - マッチパターン（ワイルドカード*可）
 * @returns {boolean} - マッチするかどうか
 */
function matchesPattern(filePath, pattern) {
  // 完全一致の場合
  if (filePath === pattern) {
    return true;
  }

  // ワイルドカードパターンの場合
  if (pattern.includes("*")) {
    // 'contact/*' → 'contact/'で始まる任意のファイル
    if (pattern.endsWith("*")) {
      const prefix = pattern.slice(0, -1);
      return filePath.startsWith(prefix);
    }

    // その他の複雑なワイルドカードパターンはここで処理
    // 必要に応じて正規表現に変換してマッチング
    const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*");
    return new RegExp(`^${regexPattern}$`).test(filePath);
  }

  return false;
}

/**
 * ファイルにスニペットを適用するかどうかを判定する関数
 * @param {string} snippetName - スニペット名（"head-snippet"または"body-snippet"など）
 * @param {string} filePath - HTMLファイルのパス
 * @param {Object} config - スニペット設定
 * @returns {boolean} - スニペットを適用するかどうか
 */
export function shouldApplySnippet(snippetName, filePath, config) {
  if (!config || !config[snippetName]) {
    return false;
  }

  const { applyTo, excludeFrom } = config[snippetName];

  // 除外リストに含まれる場合は適用しない
  if (
    excludeFrom &&
    excludeFrom.some((pattern) => matchesPattern(filePath, pattern))
  ) {
    return false;
  }

  // 適用リストに"all"が含まれるか、パターンに一致する場合は適用する
  if (
    applyTo &&
    (applyTo.includes("all") ||
      applyTo.some((pattern) => matchesPattern(filePath, pattern)))
  ) {
    return true;
  }

  return false;
}

/**
 * スニペット名から挿入先タグを判定する関数
 * @param {string} snippetName - スニペット名
 * @returns {string} - 'head'または'body'
 */
export function getSnippetTargetTag(snippetName) {
  if (snippetName.startsWith("head-")) {
    return "head";
  } else if (snippetName.startsWith("body-")) {
    return "body";
  }
  // デフォルトはbody
  return "body";
}

/**
 * スニペットの優先度を取得
 * @param {string} snippetName - スニペット名
 * @param {Object} config - スニペット設定
 * @returns {number} - 優先度（高いほど後に挿入）
 */
export function getSnippetPriority(snippetName, config) {
  if (
    config &&
    config[snippetName] &&
    typeof config[snippetName].priority === "number"
  ) {
    return config[snippetName].priority;
  }
  return 0; // デフォルト優先度
}

/**
 * スニペットの挿入位置を取得
 * @param {string} snippetName - スニペット名
 * @param {Object} config - スニペット設定
 * @returns {string} - 'prepend'または'append'
 */
export function getSnippetPosition(snippetName, config) {
  if (
    config &&
    config[snippetName] &&
    config[snippetName].position === "append"
  ) {
    return "append";
  }
  return "prepend"; // デフォルトは先頭に挿入
}

/**
 * 使用可能なすべてのスニペットを読み込む関数
 * @returns {Object} - スニペット名とその内容のマップ
 */
export function loadAllSnippets() {
  const snippetsDir = paths.html.snippets;
  const snippets = {};

  try {
    // .jsonファイルを除外
    const files = fs
      .readdirSync(snippetsDir)
      .filter((file) => file.endsWith(".html"));

    for (const file of files) {
      const snippetName = path.basename(file, ".html");
      const filePath = path.join(snippetsDir, file);
      const content = readFileContent(filePath);

      if (content) {
        snippets[snippetName] = content.trim();
        log("HTML", `スニペット読み込み: ${snippetName}`, "info");
      }
    }

    return snippets;
  } catch (error) {
    log("HTML", `スニペット読み込みエラー: ${error.message}`, "error");
    return {};
  }
}

/**
 * 外部ファイルからコードスニペットを読み込む関数（後方互換性用）
 * @param {string} snippetName - スニペット名（"head-snippet"または"body-snippet"など）
 * @returns {string|null} - スニペットの内容、または失敗時はnull
 */
export function loadSnippet(snippetName) {
  const filePath = path.join(paths.html.snippets, `${snippetName}.html`);
  const snippet = readFileContent(filePath);

  if (snippet) {
    log(
      "HTML",
      `${snippetName}のスニペットを読み込みました: ${filePath}`,
      "success"
    );
    return snippet.trim();
  } else {
    log(
      "HTML",
      `${snippetName}のスニペットファイルが見つかりません: ${filePath}`,
      "warning"
    );
    return null;
  }
}

/**
 * HTMLを整形する関数（Prettierを使用）
 * @param {string} html - 元のHTML
 * @returns {Promise<string>} - 整形されたHTML
 */
export async function formatHTML(html) {
  try {
    // Prettierでフォーマット
    return await prettier.format(html, options.prettier);
  } catch (error) {
    log("HTML", `整形エラー: ${error.message}`, "error");
    return html; // エラー時は元のHTMLを返す
  }
}

/**
 * リンクタグをインデントして改行を追加する関数
 * @param {string} html - 処理するHTML
 * @returns {string} - 整形されたHTML
 */
export function formatPreloadLinks(html) {
  // linkタグを検出して改行を追加
  return html.replace(/(<link[^>]*>)(?![\s]*\n)/g, "$1\n    ");
}

/**
 * 画像が処理対象外かどうかを判定する関数
 * @param {string} src - 画像のパス
 * @param {boolean} isInHead - headタグ内かどうか
 * @returns {boolean} - 処理対象外かどうか
 */
export function shouldSkipImageConversion(src, isInHead = false) {
  // srcがない場合はスキップ
  if (!src) return true;

  // faviconはスキップ
  if (src.includes("favicon")) return true;

  // headタグ内のリンク要素はスキップ
  if (isInHead) return true;

  return false;
}

/**
 * 画像が対象の拡張子を持つか判定する関数
 * @param {string} src - 画像のパス
 * @returns {boolean} - 対象の拡張子を持つかどうか
 */
export function hasConvertibleExtension(src) {
  const extPattern = /\.(jpe?g|png|gif)$/i;
  return extPattern.test(src);
}

/**
 * 画像パスをWebP形式に変換する関数
 * @param {string} src - 元の画像パス
 * @returns {string} - WebP形式のパス
 */
export function convertPathToWebP(src) {
  const extPattern = /\.(jpe?g|png|gif)$/i;
  return src.replace(extPattern, ".webp");
}

/**
 * HTML中のWebP変換処理状況をログ出力する関数
 * @param {number} count - 変換した画像数
 * @param {string} filePath - HTMLファイルのパス
 */
export function logWebPConversion(count, filePath) {
  if (count > 0) {
    log(
      "HTML",
      `WebPパス変換: ${colors.yellow}${count}${colors.reset} 画像を ${colors.yellow}${filePath}${colors.reset} で変換しました`,
      "success"
    );
  }
}

/**
 * プリロードリンクの追加状況をログ出力する関数
 * @param {number} count - 追加したリンク数
 * @param {string} filePath - HTMLファイルのパス
 */
export function logPreloadLinks(count, filePath) {
  if (count > 0) {
    log(
      "HTML",
      `${colors.yellow}${count}${colors.reset} 個のプリロードリンクを ${colors.yellow}${filePath}${colors.reset} に追加しました`,
      "success"
    );
  }
}

/**
 * HTMLのスニペット挿入状況をログ出力する関数
 * @param {string} snippetName - スニペット名
 * @param {string} targetTag - 挿入先タグ
 * @param {string} filePath - HTMLファイルのパス
 * @param {number} priority - 優先度
 * @param {string} position - 挿入位置
 */
export function logSnippetInsertion(
  snippetName,
  targetTag,
  filePath,
  priority,
  position
) {
  const positionText = position === "append" ? "末尾" : "先頭";
  log(
    "HTML",
    `${colors.yellow}${snippetName}${colors.reset} を ${colors.yellow}${filePath}${colors.reset} の <${targetTag}> ${positionText}に挿入しました (優先度:${priority})`,
    "success"
  );
}

/**
 * CSS/SCSS内のbackground-image URLをWebP形式に変換する関数
 * @param {string} css - 元のCSS文字列
 * @returns {string} - WebP形式に変換されたCSS文字列
 */
export function convertBackgroundImageToWebP(css) {
  // background-image: url() のパターンを検出（gifは除外）
  const urlPattern =
    /background-image:\s*url\(['"]?([^'")]+\.(?:jpe?g|png))['"]?\)/gi;

  let convertedCount = 0;
  const convertedCss = css.replace(urlPattern, (match, imagePath) => {
    // faviconはスキップ
    if (imagePath.includes("favicon")) {
      return match;
    }

    // WebP形式に変換
    const webpPath = convertPathToWebP(imagePath);
    convertedCount++;

    return match.replace(imagePath, webpPath);
  });

  return { css: convertedCss, count: convertedCount };
}

/**
 * CSS中のWebP変換処理状況をログ出力する関数
 * @param {number} count - 変換した画像数
 * @param {string} filePath - CSSファイルのパス
 */
export function logCSSWebPConversion(count, filePath) {
  if (count > 0) {
    log(
      "CSS",
      `WebPパス変換: ${colors.yellow}${count}${colors.reset} 画像を ${colors.yellow}${filePath}${colors.reset} で変換しました`,
      "success"
    );
  }
}
