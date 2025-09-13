/**
 * gulp/utils.js - Gulpタスク用のユーティリティ関数
 * タスク間で共有する汎用的な関数を提供
 */

import browserSync from "browser-sync";
import fs from "fs";
import path from "path";
import { colors } from "./config.js";

// BrowserSyncのインスタンス作成
export const server = browserSync.create();

/**
 * 標準化されたログ出力関数
 * @param {string} task - タスク名
 * @param {string} message - 表示するメッセージ
 * @param {string} level - ログレベル ('info', 'success', 'warning', 'error')
 */
export function log(task, message, level = "info") {
  const timestamp = new Date().toLocaleTimeString();
  let prefix = "";

  switch (level) {
    case "success":
      prefix = `${colors.green}✓ `;
      break;
    case "warning":
      prefix = `${colors.yellow}⚠ `;
      break;
    case "error":
      prefix = `${colors.bgRed}${colors.white} エラー ${colors.reset}${colors.red} `;
      break;
    case "info":
    default:
      prefix = `${colors.cyan}ℹ `;
      break;
  }

  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${prefix}${colors.bright}[${task}]${colors.reset} ${message}${colors.reset}`);
}

/**
 * エラーハンドラー - エラーを表示して処理を継続
 * @param {Error} err - エラーオブジェクト
 */
export function handleError(err) {
  log("Gulp", err.toString(), "error");
  this.emit("end"); // streamの処理を継続
}

/**
 * ディレクトリが存在しない場合は作成する
 * @param {string} dirPath - 作成するディレクトリのパス
 * @returns {boolean} - ディレクトリが既に存在したか新規作成されたか
 */
export function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return false; // 新規作成
  }
  return true; // 既存
}

/**
 * ファイルパスから拡張子を取得（先頭のドットを除く）
 * @param {string} filePath - ファイルパス
 * @returns {string} - 小文字の拡張子
 */
export function getExtension(filePath) {
  return path.extname(filePath).toLowerCase().slice(1);
}

/**
 * ファイルパスから拡張子なしのファイル名を取得
 * @param {string} filePath - ファイルパス
 * @returns {string} - 拡張子なしのファイル名
 */
export function getBaseName(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * 相対パスを取得
 * @param {string} basePath - 基準パス
 * @param {string} targetPath - 対象パス
 * @returns {string} - 相対パス
 */
export function getRelativePath(basePath, targetPath) {
  return path.relative(basePath, targetPath);
}

/**
 * ファイルの内容を読み込む
 * @param {string} filePath - ファイルパス
 * @param {Object} options - 読み込みオプション
 * @returns {string|null} - ファイルの内容、または失敗時はnull
 */
export function readFileContent(filePath, options = { encoding: "utf8" }) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, options);
    }
    return null;
  } catch (error) {
    log("ファイル", `${filePath} の読み込みに失敗しました: ${error.message}`, "error");
    return null;
  }
}

/**
 * 空行を削除する関数
 * @param {string} content - 処理する文字列
 * @returns {string} - 空行を削除した文字列
 */
export function removeExtraNewlines(content) {
  return content.replace(/\n\s*\n/g, "\n");
}
