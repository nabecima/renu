/**
 * gulp/tasks/styles.js - SCSSの処理タスク
 * SCSSファイルをCSSに変換し、開発モードではソースマップを生成
 */

import gulp from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import csso from "gulp-csso";
import through from "through2";
import { paths, options, buildMode, colors } from "../config.js";
import { server, log, handleError } from "../utils.js";
import { convertBackgroundImageToWebP, logCSSWebPConversion } from "../html-utils.js";

// sassコンパイラの設定
const sass = gulpSass(dartSass);


/**
 * SCSSをCSSにコンパイルするタスク
 * @returns {NodeJS.ReadWriteStream} - Gulpストリーム
 */
export function scss() {
  // サーブモードでのみソースマップを生成
  const useSourcemaps = buildMode.isServing;

  // 本番モードのみCSSを圧縮
  const shouldMinify = !buildMode.isDevelopment && !buildMode.isServing;

  // SCSSのモードと設定をログ出力
  log(
    "SCSS",
    `SCSS処理: ${
      buildMode.isDevelopment ? (useSourcemaps ? `${colors.green}開発モード（ソースマップあり）` : `${colors.green}開発モード（ソースマップなし）`) : `${colors.blue}本番モード（圧縮あり）`
    }`,
    "info"
  );

  // 適切なSASS設定を選択
  const sassOptions = buildMode.isDevelopment ? options.scss.development : options.scss.production;

  // Gulp 4ではsourcemapsオプションを直接使用
  // paths.scss.srcが関数の場合は実行して配列を取得
  const scssSource = typeof paths.scss.src === 'function' ? paths.scss.src() : paths.scss.src;
  
  let stream = gulp.src(scssSource, {
    allowEmpty: true,
    sourcemaps: useSourcemaps
  });

  // SCSSをCSSにコンパイル
  stream = stream.pipe(
    sass({
      ...sassOptions,
      includePaths: ["node_modules"]
    }).on("error", handleError)
  );

  // サーブモード以外（dev/build）でWebP変換を実行
  if (!buildMode.isServing) {
    stream = stream.pipe(
      through.obj(function (file, _enc, cb) {
        if (file.isNull() || file.isDirectory()) {
          return cb(null, file);
        }

        // ファイルのパスを取得（ログ用）
        const filePath = file.relative || "不明なファイル";

        // ファイルの内容をUTF-8文字列として取得
        const content = file.contents.toString("utf8");

        // CSS内のbackground-image URLをWebP形式に変換
        const { css: convertedCss, count } = convertBackgroundImageToWebP(content);

        // WebP変換のカウント表示
        logCSSWebPConversion(count, filePath);

        // 変換されたCSSを書き戻し
        file.contents = Buffer.from(convertedCss);
        cb(null, file);
      })
    );
  }

  // Autoprefixerでベンダープレフィックスを追加
  stream = stream.pipe(autoprefixer(options.scss.autoprefixer).on("error", handleError));

  // 本番モードのみCSSOで圧縮（セレクター破壊を防ぐため）
  if (shouldMinify) {
    log("SCSS", "CSSOでCSSを圧縮しています...", "info");
    stream = stream.pipe(csso({
      restructure: false, // セレクターの再構築を無効化
      comments: false, // コメントを削除
    }).on("error", handleError));
  }

  // 出力先にCSSを書き込み（Gulp 4のsourcemapsオプションを使用）
  return stream
    .pipe(
      gulp.dest(paths.scss.dist, {
        sourcemaps: useSourcemaps ? "." : false
      })
    )
    .pipe(server.stream({ match: "**/*.css" }));
}

// scssタスクをデフォルトエクスポートとしても公開
export default scss;
