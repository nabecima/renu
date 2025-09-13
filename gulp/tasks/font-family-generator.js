/**
 * gulp/tasks/font-family-generator.js - 開発環境専用のフォントファミリー生成ツールタスク
 * サーブモード時のみ利用可能でビルド時には出力されない
 */

import gulp from "gulp";
import { paths, buildMode, colors } from "../config.js";
import { server, log } from "../utils.js";

/**
 * フォントファミリー生成ツールのHTMLをコピーするタスク
 * サーブモード時のみ実行される
 * @returns {NodeJS.ReadWriteStream|null} - Gulpストリームまたはnull
 */
export function fontFamilyGenerator() {
  // サーブモード時のみ処理を実行
  if (!buildMode.isServing) {
    log("フォントファミリー生成", `${colors.yellow}開発モードまたは本番モード${colors.reset}のため、フォントファミリー生成ツールはスキップされます`, "info");
    return Promise.resolve(); // 空のPromiseを返してタスクを完了させる
  }

  log("フォントファミリー生成", `${colors.green}サーブモード${colors.reset}のため、フォントファミリー生成ツールを有効化します`, "info");

  // フォントファミリー生成ツールのソースパス
  const fontFamilyGeneratorSrc = paths.fontFamilyGenerator.src;

  // distディレクトリにコピー
  return gulp
    .src(fontFamilyGeneratorSrc, { allowEmpty: true })
    .pipe(gulp.dest(paths.fontFamilyGenerator.dist))
    .pipe(server.stream());
}

// デフォルトエクスポート
export default fontFamilyGenerator;