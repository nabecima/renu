/**
 * gulp/tasks/images.js - 画像処理タスク
 * サーブモード時はそのままコピー、ビルド時はWebP変換を行う
 */

import gulp from "gulp";
import through from "through2";
import path from "path";
import fs from "fs";
import { paths, buildMode } from "../config.js";
import { server, log, ensureDirectoryExists, getExtension, getBaseName, getRelativePath } from "../utils.js";
import { convertToWebP, copyImage } from "../image-utils.js";

// 定数定義
const IMAGE_EXTENSIONS = "**/*.{jpg,jpeg,png,gif,svg,webp}";
const PROGRESS_UPDATE_INTERVAL = 100; // ms


/**
 * faviconディレクトリの画像をそのままコピーするタスク
 * favicon内の画像はWebP変換を行わない
 * @returns {NodeJS.ReadWriteStream} - Gulpストリーム
 */
export function faviconImages() {
  log("画像", "faviconを処理せずにコピーします", "info");

  ensureDirectoryExists(path.dirname(paths.images.favicon.dist));

  return gulp
    .src(paths.images.favicon.src, { allowEmpty: true })
    .pipe(gulp.dest(paths.images.favicon.dist))
    .pipe(server.stream({ match: IMAGE_EXTENSIONS }));
}

/**
 * 通常の画像を処理するタスク
 * 開発モードでは変換せずにコピー、本番モードではWebP変換
 * @returns {NodeJS.ReadWriteStream} - Gulpストリーム
 */
export function processImages() {
  const skipWebP = buildMode.isServing;
  const mode = skipWebP ? "サーブモード（コピーのみ）" : "ビルドモード（WebP変換）";
  
  log("画像", `画像ファイルを処理: ${mode}`, "info");

  const srcPattern = createSourcePattern();
  ensureDirectoryExists(paths.images.dist);

  return skipWebP ? processSimpleCopy(srcPattern) : processWithWebPConversion(srcPattern);
}

/**
 * ソースパターンを作成
 * @returns {string[]} - ソースパターン配列
 */
function createSourcePattern() {
  // paths.images.srcが配列の場合は展開し、faviconディレクトリを除外
  const baseSrc = Array.isArray(paths.images.src) ? paths.images.src : [paths.images.src];
  
  // faviconディレクトリの除外パターンを作成
  // favicon.srcが配列の場合は最初の正のパターンのみを除外対象とする
  const faviconSrc = Array.isArray(paths.images.favicon.src) 
    ? paths.images.favicon.src[0] // 配列の最初の要素のみ使用
    : paths.images.favicon.src;
  
  return [
    ...baseSrc,
    `!${faviconSrc}` // favicon ディレクトリを除外
  ];
}

/**
 * シンプルコピー処理（サーブモード用）
 * @param {string[]} srcPattern - ソースパターン
 * @returns {NodeJS.ReadWriteStream} - Gulpストリーム
 */
function processSimpleCopy(srcPattern) {
  return gulp
    .src(srcPattern, { allowEmpty: true })
    .pipe(filterEmptyDirectories())
    .pipe(gulp.dest(paths.images.dist))
    .pipe(server.stream({ match: IMAGE_EXTENSIONS }));
}

/**
 * WebP変換付き処理（ビルドモード用）
 * @param {string[]} srcPattern - ソースパターン
 * @returns {NodeJS.ReadWriteStream} - Gulpストリーム
 */
function processWithWebPConversion(srcPattern) {
  const stats = createProgressTracker();

  return gulp
    .src(srcPattern, { allowEmpty: true })
    .pipe(filterEmptyDirectories())
    .pipe(countConvertibleFiles(stats))
    .pipe(processImageFiles(stats))
    .pipe(server.stream({ match: IMAGE_EXTENSIONS }));
}

/**
 * 進捗トラッカーを作成
 * @returns {Object} - 進捗管理オブジェクト
 */
function createProgressTracker() {
  return {
    totalFiles: 0,
    processedFiles: 0,
    successCount: 0
  };
}

/**
 * 変換対象ファイル数をカウント
 * @param {Object} stats - 進捗管理オブジェクト
 * @returns {NodeJS.ReadWriteStream} - through2ストリーム
 */
function countConvertibleFiles(stats) {
  return through.obj((file, enc, cb) => {
    if (shouldProcessFile(file)) {
      const ext = getExtension(file.path);
      if (paths.images.types.convert.includes(ext)) {
        stats.totalFiles++;
      }
    }
    cb(null, file);
  });
}

/**
 * 画像ファイルを処理
 * @param {Object} stats - 進捗管理オブジェクト
 * @returns {NodeJS.ReadWriteStream} - through2ストリーム
 */
function processImageFiles(stats) {
  return through.obj(function (file, enc, cb) {
    if (!shouldProcessFile(file)) {
      return cb(null, file);
    }

    const fileInfo = extractFileInfo(file);
    const isConvertible = paths.images.types.convert.includes(fileInfo.extension);

    if (isConvertible) {
      processConvertibleImage(file, fileInfo, stats, cb);
    } else {
      processCopyOnlyImage(file, fileInfo, cb);
    }
  });
}

/**
 * ファイルが処理対象か判定
 * @param {Object} file - Gulpファイルオブジェクト
 * @returns {boolean} - 処理対象かどうか
 */
function shouldProcessFile(file) {
  return !file.isNull() && !file.isDirectory() && !isGitkeepFile(file);
}

/**
 * .gitkeepファイルか判定
 * @param {Object} file - Gulpファイルオブジェクト
 * @returns {boolean} - .gitkeepファイルかどうか
 */
function isGitkeepFile(file) {
  return path.basename(file.path) === '.gitkeep';
}

/**
 * .gitkeepファイルのみのディレクトリをフィルタリング
 * @returns {NodeJS.ReadWriteStream} - through2ストリーム
 */
function filterEmptyDirectories() {
  return through.obj(function (file, enc, cb) {
    if (file.isNull() || file.isDirectory()) {
      return cb(null, file);
    }

    // .gitkeepファイルの場合、同じディレクトリに他のファイルがあるかチェック
    if (isGitkeepFile(file)) {
      const dirPath = path.dirname(file.path);
      
      try {
        const files = fs.readdirSync(dirPath);
        const nonGitkeepFiles = files.filter(f => f !== '.gitkeep');
        
        // .gitkeepファイルのみの場合はスキップ
        if (nonGitkeepFiles.length === 0) {
          return cb(); // ファイルを出力しない
        }
      } catch (err) {
        // ディレクトリの読み取りエラーの場合はファイルを通す
        return cb(null, file);
      }
    }
    
    cb(null, file);
  });
}

/**
 * ファイル情報を抽出
 * @param {Object} file - Gulpファイルオブジェクト
 * @returns {Object} - ファイル情報
 */
function extractFileInfo(file) {
  const extension = getExtension(file.path);
  const relativePath = getRelativePath(path.join(paths.src, "images"), file.path);
  const outputDir = path.dirname(path.join(paths.images.dist, relativePath));
  const baseName = getBaseName(file.path);

  return { extension, relativePath, outputDir, baseName };
}

/**
 * 変換対象画像を処理
 * @param {Object} file - Gulpファイルオブジェクト
 * @param {Object} fileInfo - ファイル情報
 * @param {Object} stats - 進捗管理オブジェクト
 * @param {Function} cb - コールバック関数
 */
function processConvertibleImage(file, fileInfo, stats, cb) {
  const outputPath = path.join(fileInfo.outputDir, `${fileInfo.baseName}.webp`);

  convertToWebP(file.contents, outputPath)
    .then((success) => {
      stats.processedFiles++;
      if (success) stats.successCount++;

      updateProgress(stats);
      cb(null, file);
    })
    .catch((err) => {
      log("画像", `変換エラー (${file.path}): ${err.message}`, "error");
      stats.processedFiles++;
      cb(null, file);
    });
}

/**
 * コピーのみ画像を処理
 * @param {Object} file - Gulpファイルオブジェクト
 * @param {Object} fileInfo - ファイル情報
 * @param {Function} cb - コールバック関数
 */
function processCopyOnlyImage(file, fileInfo, cb) {
  const outputPath = path.join(paths.dist, getRelativePath(paths.src, file.path));

  copyImage(file.contents, outputPath)
    .then(() => cb(null, file))
    .catch((err) => {
      log("画像", `コピーエラー (${file.path}): ${err.message}`, "error");
      cb(null, file);
    });
}

/**
 * 進捗表示を更新
 * @param {Object} stats - 進捗管理オブジェクト
 */
function updateProgress(stats) {
  if (stats.totalFiles === 0) return;

  const percent = Math.round((stats.processedFiles / stats.totalFiles) * 100);
  process.stdout.write(`\rWebP変換: ${percent}% (${stats.processedFiles}/${stats.totalFiles})`);

  if (stats.processedFiles === stats.totalFiles) {
    log("画像", `\nWebP変換完了 (${stats.successCount}/${stats.totalFiles} 成功)`, "success");
  }
}

/**
 * 画像処理のメインタスク - faviconImages、processImagesを並行実行
 * @type {Function} - Gulpタスク
 */
export const images = gulp.parallel(faviconImages, processImages);
