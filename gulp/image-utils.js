/**
 * gulp/image-utils.js - 画像処理に特化したユーティリティ関数
 * 画像の変換、寸法取得などの機能を提供
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { log, ensureDirectoryExists } from "./utils.js";
import { paths, options } from "./config.js";

// 定数定義
const RETINA_SCALE_FACTOR = 2;
const SUPPORTED_IMAGE_FORMATS = {
  WEBP: 'webp',
  JPEG: 'jpeg',
  PNG: 'png',
  SVG: 'svg'
};

/**
 * 画像のサイズを取得する関数
 * @param {string} filePath - 画像ファイルのパス
 * @returns {Promise<Object|null>} - width, heightを含むオブジェクト、またはnull
 */
export async function getImageDimensions(filePath) {
  try {
    if (!await fileExists(filePath)) {
      log("画像", `ファイルが見つかりません: ${filePath}`, "warning");
      return null;
    }

    const metadata = await getImageMetadata(filePath);
    if (!metadata) return null;

    return {
      width: Math.round(metadata.width / RETINA_SCALE_FACTOR),
      height: Math.round(metadata.height / RETINA_SCALE_FACTOR)
    };
  } catch (error) {
    handleImageError(filePath, '寸法取得エラー', error);
    return null;
  }
}

/**
 * 画像をWebP形式に変換して保存する
 * @param {Buffer} buffer - 画像のバッファ
 * @param {string} outputPath - 出力ファイルパス
 * @returns {Promise<boolean>} - 成功したかどうか
 */
export async function convertToWebP(buffer, outputPath) {
  try {
    const webpBuffer = await processImageBuffer(buffer, SUPPORTED_IMAGE_FORMATS.WEBP);
    await saveImageBuffer(webpBuffer, outputPath);
    return true;
  } catch (error) {
    handleImageError(outputPath, 'WebP変換エラー', error);
    return false;
  }
}

/**
 * ファイルが画像変換対象かどうかを判定
 * @param {string} filePath - ファイルパス
 * @returns {boolean} - 変換対象かどうか
 */
export function isConvertibleImage(filePath) {
  return checkImageType(filePath, paths.images.types.convert);
}

/**
 * ファイルがコピーのみ対象かどうかを判定
 * @param {string} filePath - ファイルパス
 * @returns {boolean} - コピー対象かどうか
 */
export function isCopyOnlyImage(filePath) {
  return checkImageType(filePath, paths.images.types.copyOnly);
}

/**
 * 元の画像パスからWebP形式のパスを生成
 * @param {string} originalPath - 元の画像パス
 * @returns {string} - WebP形式のパス
 */
export function createWebPPath(originalPath) {
  return changeFileExtension(originalPath, SUPPORTED_IMAGE_FORMATS.WEBP);
}

/**
 * 画像をそのままコピーする
 * @param {Buffer} buffer - 画像のバッファ
 * @param {string} outputPath - 出力ファイルパス
 * @returns {Promise<boolean>} - 成功したかどうか
 */
export async function copyImage(buffer, outputPath) {
  try {
    await saveImageBuffer(buffer, outputPath);
    return true;
  } catch (error) {
    handleImageError(outputPath, 'ファイルコピーエラー', error);
    return false;
  }
}

/**
 * HTML用のプリロードリンクを生成
 * @param {string} src - 画像のsrc属性
 * @param {string|null} media - メディアクエリ（レスポンシブ用）
 * @returns {string} - プリロード用のlink要素
 */
export function createPreloadLink(src, media = null) {
  const imgType = getImageMimeType(src);
  const baseLink = `<link rel="preload" href="${src}" as="image" type="${imgType}">`;
  
  return media ? baseLink.replace('>', ` media="${media}">`) : baseLink;
}

// ====================
// プライベートユーティリティ関数
// ====================

/**
 * ファイルが存在するかチェック
 * @param {string} filePath - ファイルパス
 * @returns {Promise<boolean>} - ファイルが存在するかどうか
 */
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 画像のメタデータを取得
 * @param {string} filePath - 画像ファイルパス
 * @returns {Promise<Object|null>} - メタデータまたはnull
 */
async function getImageMetadata(filePath) {
  try {
    return await sharp(filePath).metadata();
  } catch (error) {
    handleImageError(filePath, 'メタデータ取得エラー', error);
    return null;
  }
}

/**
 * 画像バッファを処理
 * @param {Buffer} buffer - 入力バッファ
 * @param {string} format - 出力フォーマット
 * @returns {Promise<Buffer>} - 処理済みバッファ
 */
async function processImageBuffer(buffer, format) {
  const sharpInstance = sharp(buffer);
  
  switch (format) {
    case SUPPORTED_IMAGE_FORMATS.WEBP:
      return await sharpInstance.webp(options.images.webp).toBuffer();
    case SUPPORTED_IMAGE_FORMATS.JPEG:
      return await sharpInstance.jpeg().toBuffer();
    case SUPPORTED_IMAGE_FORMATS.PNG:
      return await sharpInstance.png().toBuffer();
    default:
      return buffer;
  }
}

/**
 * 画像バッファをファイルに保存
 * @param {Buffer} buffer - 保存するバッファ
 * @param {string} outputPath - 出力パス
 * @returns {Promise<void>}
 */
async function saveImageBuffer(buffer, outputPath) {
  ensureDirectoryExists(path.dirname(outputPath));
  await fs.promises.writeFile(outputPath, buffer);
}

/**
 * 画像タイプをチェック
 * @param {string} filePath - ファイルパス
 * @param {string[]} allowedTypes - 許可されたタイプ一覧
 * @returns {boolean} - 許可されたタイプかどうか
 */
function checkImageType(filePath, allowedTypes) {
  const ext = path.extname(filePath).toLowerCase().slice(1);
  return allowedTypes.includes(ext);
}

/**
 * ファイルの拡張子を変更
 * @param {string} filePath - 元のファイルパス
 * @param {string} newExtension - 新しい拡張子
 * @returns {string} - 新しいファイルパス
 */
function changeFileExtension(filePath, newExtension) {
  const dir = path.dirname(filePath);
  const name = path.basename(filePath, path.extname(filePath));
  return path.join(dir, `${name}.${newExtension}`);
}

/**
 * 画像のMIMEタイプを取得
 * @param {string} src - 画像のURL
 * @returns {string} - MIMEタイプ
 */
function getImageMimeType(src) {
  const ext = path.extname(src).toLowerCase();
  const mimeMap = {
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };
  
  return mimeMap[ext] || 'image/jpeg';
}

/**
 * 画像エラーをハンドリング
 * @param {string} filePath - ファイルパス
 * @param {string} operation - 操作名
 * @param {Error} error - エラーオブジェクト
 */
function handleImageError(filePath, operation, error) {
  log("画像", `${operation} (${filePath}): ${error.message}`, "error");
}