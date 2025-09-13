/**
 * gulp/tasks/serve.js - 開発サーバーとファイル監視
 * ローカルサーバーを起動し、ファイル変更を監視
 */

import gulp from "gulp";
import { paths, options, buildMode } from "../config.js";
import { server, log } from "../utils.js";
import { clean } from "./clean.js";
import { images } from "./images.js";
// htmlをデフォルトインポートとして読み込む
import html from "./html.js";
import { js } from "./scripts.js";
import { scss } from "./styles.js";
// シャドウ変換ツールタスクをインポート
import { shadowConverter } from "./shadow-converter.js";
// フォントファミリージェネレータータスクをインポート
import { fontFamilyGenerator } from "./font-family-generator.js";

/**
 * ブラウザリロード関数
 * @param {Function} done - 完了時のコールバック
 */
export function reload(done) {
  server.reload();
  done();
}

/**
 * ファイル変更を監視するタスク
 * 各ファイルタイプごとに対応するタスクを実行
 */
export function watch() {
  log("監視", "ファイル変更の監視を開始します...", "info");

  // HTMLファイルの変更を監視
  // paths.html.srcが関数の場合は実行して配列を取得
  const htmlSources = typeof paths.html.src === 'function' ? paths.html.src() : paths.html.src;
  gulp.watch(
    htmlSources,
    { ignoreInitial: true },
    gulp.series(html, (done) => {
      log("監視", "HTMLファイルが変更されました", "info");
      done();
    })
  );

  // シャドウ変換ツールファイルの変更を監視
  gulp.watch(
    paths.shadowConverter.src,
    { ignoreInitial: true },
    gulp.series(shadowConverter, (done) => {
      log("監視", "シャドウ変換ツールが変更されました", "info");
      done();
    })
  );

  // フォントファミリージェネレーターファイルの変更を監視
  gulp.watch(
    paths.fontFamilyGenerator.src,
    { ignoreInitial: true },
    gulp.series(fontFamilyGenerator, (done) => {
      log("監視", "フォントファミリージェネレーターが変更されました", "info");
      done();
    })
  );

  // JavaScriptファイルの変更を監視
  gulp.watch(
    paths.js.src,
    { ignoreInitial: true },
    gulp.series(js, (done) => {
      log("監視", "JavaScriptファイルが変更されました", "info");
      done();
    })
  );

  // SCSSファイルの変更を監視
  gulp.watch(
    paths.scss.watch,
    { ignoreInitial: true },
    gulp.series(scss, (done) => {
      log("監視", "SCSSファイルが変更されました", "info");
      done();
    })
  );

  // 画像ファイルの変更を監視
  gulp.watch(
    paths.images.src,
    { ignoreInitial: true },
    gulp.series(images, (done) => {
      log("監視", "画像ファイルが変更されました", "info");
      done();
    })
  );
}

/**
 * 開発サーバーを起動するタスク
 * @type {Function} - Gulpシリーズタスク
 */
export const serve = gulp.series(
  // 開発モードとサーブモードに設定
  function setServeEnvironment(done) {
    buildMode.setDevelopmentMode(true);
    buildMode.setServingMode(true);
    done();
  },
  clean, // 出力ディレクトリをクリーン
  gulp.parallel(html, js, scss, images, shadowConverter, fontFamilyGenerator), // 各ファイルを変換（開発ツールを追加）
  // サーバー開始
  function startServer(done) {
    log("サーバー", "開発サーバーを起動しています...", "info");

    // BrowserSyncサーバーを起動
    server.init(options.browserSync);

    // ファイル変更の監視を開始
    watch();

    log("サーバー", `サーバーが開始されました: http://localhost:${options.browserSync.port}`, "success");
    done();
  }
);
