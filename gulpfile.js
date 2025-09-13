/**
 * gulpfile.js - Gulpのメインファイル
 * タスクを定義してコマンドラインから実行できるようにする
 */

import gulp from "gulp";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// タスクをインポート
import { clean } from "./gulp/tasks/clean.js";
import { images } from "./gulp/tasks/images.js";
import { html } from "./gulp/tasks/html.js";
import { serve } from "./gulp/tasks/serve.js";
import { js } from "./gulp/tasks/scripts.js";
import { scss } from "./gulp/tasks/styles.js";
import { shadowConverter } from "./gulp/tasks/shadow-converter.js";
import { fontFamilyGenerator } from "./gulp/tasks/font-family-generator.js";
import { createZip } from "./gulp/tasks/zip.js";

// 設定をインポート
import { buildMode } from "./gulp/config.js";
import { log } from "./gulp/utils.js";

// コマンドライン引数を解析
const argv = yargs(hideBin(process.argv))
  .option("snippets", {
    describe: "スニペットを挿入するかどうか",
    type: "boolean",
    default: true
  })
  .option("privacy-policy", {
    describe: "プライバシーポリシーCSSを出力するかどうか",
    type: "boolean",
    default: true
  })
  .argv;

// 個別タスクをエクスポート（コマンドラインから直接実行可能）
export { clean, images, html, js, scss, serve, shadowConverter, fontFamilyGenerator, createZip };

/**
 * 開発用ビルドタスク - npm run dev
 * 開発モードで出力するが、ローカルサーバーは起動しない
 */
export const dev = gulp.series(
  // 開発モードに設定、サーブモードはOFF
  function setDevEnvironment(done) {
    buildMode.setDevelopmentMode(true);
    buildMode.setServingMode(false);
    // スニペット挿入フラグを設定（コマンドラインから取得）
    buildMode.setSnippetsMode(argv.snippets);
    // プライバシーポリシーCSS出力フラグを設定（コマンドラインから取得）
    buildMode.setPrivacyPolicyMode(argv.privacyPolicy);
    log("Gulp", "開発モードでビルドします", "info");
    done();
  },
  clean,
  gulp.parallel(html, js, scss, images),
  createZip // ビルド完了後にZIP作成
  // shadowConverterは含めない（開発モードでは生成しない）
);

/**
 * 本番用ビルドタスク - npm run build
 * 本番モードで最適化して出力する
 */
export const build = gulp.series(
  // 本番モードに設定、サーブモードはOFF
  function setProdEnvironment(done) {
    buildMode.setDevelopmentMode(false);
    buildMode.setServingMode(false);
    // スニペット挿入フラグを設定（コマンドラインから取得）
    buildMode.setSnippetsMode(argv.snippets);
    // プライバシーポリシーCSS出力フラグを設定（コマンドラインから取得）
    buildMode.setPrivacyPolicyMode(argv.privacyPolicy);
    log("Gulp", `本番モードでビルドします${argv.snippets ? "" : "（スニペット挿入なし）"}${argv.privacyPolicy ? "" : "（プライバシーポリシーCSS出力なし）"}`, "info");
    done();
  },
  clean,
  gulp.parallel(html, js, scss, images),
  createZip // ビルド完了後にZIP作成
  // shadowConverterは含めない（本番モードでは生成しない）
);

/**
 * デフォルトタスク - gulp コマンドで実行される
 * 開発モードを実行
 */
export default dev;
