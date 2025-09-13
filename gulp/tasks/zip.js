/**
 * gulp/tasks/zip.js - ZIP圧縮タスク
 * distディレクトリの内容をZIPファイルに圧縮する
 * ZIPファイル名はproject.config.jsonの設定で変更可能
 */

import gulp from "gulp";
import zip from "gulp-zip";
import { paths, colors, projectConfig } from "../config.js";
import { log } from "../utils.js";

/**
 * distディレクトリをZIPファイルに圧縮するタスク
 * @returns {NodeJS.ReadWriteStream} - Gulpストリーム
 */
export function createZip() {
  const zipFileName = projectConfig.zipFileName || "lp.zip";
  
  log("ZIP", `${colors.blue}distディレクトリを${zipFileName}に圧縮しています...`, "info");

  return gulp
    .src(`${paths.dist}/**/*`)
    .pipe(zip(zipFileName))
    .pipe(gulp.dest("./"))
    .on("end", () => {
      log("ZIP", `${colors.green}${zipFileName}が作成されました`, "success");
    });
}

// デフォルトエクスポート
export default createZip;