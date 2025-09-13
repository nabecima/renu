/**
 * gulp/tasks/shadow-converter.js - 開発環境専用のシャドウ変換ツールタスク
 * サーブモード時のみ利用可能でビルド時には出力されない
 */

import gulp from "gulp";
import { paths, buildMode, colors } from "../config.js";
import { server, log } from "../utils.js";

/**
 * ドロップシャドウ変換ツールのHTMLをコピーするタスク
 * サーブモード時のみ実行される
 * @returns {NodeJS.ReadWriteStream|null} - Gulpストリームまたはnull
 */
export function shadowConverter() {
  // サーブモード時のみ処理を実行
  if (!buildMode.isServing) {
    log("シャドウ変換", `${colors.yellow}開発モードまたは本番モード${colors.reset}のため、シャドウ変換ツールはスキップされます`, "info");
    return Promise.resolve(); // 空のPromiseを返してタスクを完了させる
  }

  log("シャドウ変換", `${colors.green}サーブモード${colors.reset}のため、シャドウ変換ツールを有効化します`, "info");

  // シャドウ変換ツールのソースパス
  const shadowConverterSrc = "./src/shadow-converter.html";

  // distディレクトリにコピー
  return gulp
    .src(shadowConverterSrc, { allowEmpty: true })
    .pipe(gulp.dest(paths.html.dist))
    .pipe(server.stream());
}

// デフォルトエクスポート
export default shadowConverter;