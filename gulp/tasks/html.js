/**
 * gulp/tasks/html.js - HTML処理タスク
 * HTML最適化、画像のWebP変換、ファビコン処理、プリロード設定などを行う
 */

import gulp from "gulp";
import htmlmin from "gulp-htmlmin";
import through from "through2";
import path from "path";
import * as cheerio from "cheerio";
import { paths, options, buildMode, colors } from "../config.js";
import { server, log, handleError } from "../utils.js";
import {
  formatHTML,
  formatPreloadLinks,
  loadAllSnippets,
  loadSnippetConfig,
  getSnippetTargetTag,
  getSnippetPriority,
  getSnippetPosition,
  shouldApplySnippet,
  shouldSkipImageConversion,
  hasConvertibleExtension,
  convertPathToWebP,
  logWebPConversion,
  logPreloadLinks,
  logSnippetInsertion
} from "../html-utils.js";
import { getImageDimensions, createPreloadLink } from "../image-utils.js";

/**
 * HTMLファイルを処理するタスク
 * @returns {NodeJS.ReadWriteStream} - Gulpストリーム
 */
export function html() {
  // 開発モードまたはサーブモードの場合は圧縮しない（ただしコメントは削除する）
  const skipMinify = buildMode.isDevelopment || buildMode.isServing;
  // サーブモードの場合は画像パスの変換とプリロードをスキップ
  const skipProcessing = buildMode.isServing;

  // HTMLの処理モードをログ出力
  log(
    "HTML",
    `HTMLファイルを処理: ${skipMinify ? `${colors.green}開発モード（コメント削除）` : `${colors.blue}本番モード（圧縮あり）`}${!buildMode.insertSnippets ? "、スニペット挿入なし" : ""}`,
    "info"
  );

  if (!skipProcessing) {
    log("HTML", "WebPパス変換とプリロード設定の準備をしています", "info");
  }

  // すべてのスニペットを一度に読み込む
  const snippets = buildMode.insertSnippets ? loadAllSnippets() : {};
  // スニペット設定を読み込む
  const snippetConfig = buildMode.insertSnippets ? loadSnippetConfig() : null;

  // paths.html.srcが関数の場合は実行して配列を取得
  const htmlSource = typeof paths.html.src === 'function' ? paths.html.src() : paths.html.src;
  
  let stream = gulp.src(htmlSource, { allowEmpty: true });

  // サーブモード以外（build/dev）時のみHTML変換処理
  if (!skipProcessing) {
    // HTML解析と変換処理
    stream = stream.pipe(
      through.obj(function (file, enc, cb) {
        if (file.isNull() || file.isDirectory()) {
          return cb(null, file);
        }

        // ファイルのパスを取得（ログ用）
        const filePath = file.relative || "不明なファイル";
        const fileName = path.basename(filePath);
        log("HTML", `処理中: ${colors.yellow}${filePath}`, "info");

        // ファイルの内容をUTF-8文字列として取得
        const content = file.contents.toString("utf8");

        // cheerioでHTMLを解析
        const $ = cheerio.load(content, {
          decodeEntities: false, // HTMLエンティティをデコードしない
          xmlMode: false
        });

        // スニペット挿入フラグが有効な場合のみスニペットを挿入
        if (buildMode.insertSnippets) {
          // headとbodyの参照を取得
          const head = $("head");
          const body = $("body");

          // スニペットをタイプと優先度でグループ化
          const headSnippets = [];
          const bodySnippets = [];

          // 各スニペットについて処理とグループ化
          for (const [snippetName, snippetContent] of Object.entries(snippets)) {
            // このファイルにスニペットを適用するかチェック
            if (shouldApplySnippet(snippetName, filePath, snippetConfig)) {
              // スニペットの挿入先を判定
              const targetTag = getSnippetTargetTag(snippetName);
              // 優先度を取得
              const priority = getSnippetPriority(snippetName, snippetConfig);
              // 挿入位置を取得
              const position = getSnippetPosition(snippetName, snippetConfig);

              if (targetTag === "head") {
                headSnippets.push({ name: snippetName, content: snippetContent, priority, position });
              } else if (targetTag === "body") {
                bodySnippets.push({ name: snippetName, content: snippetContent, priority, position });
              }
            }
          }

          // 優先度でソート（高い優先度のスニペットが後で挿入され、結果的に先頭に来る）
          headSnippets.sort((a, b) => a.priority - b.priority);
          bodySnippets.sort((a, b) => a.priority - b.priority);

          // headスニペットの挿入
          for (const snippet of headSnippets) {
            if (snippet.position === "append") {
              head.append(snippet.content);
            } else {
              head.prepend(snippet.content);
            }
            logSnippetInsertion(snippet.name, "head", filePath, snippet.priority, snippet.position);
          }

          // bodyスニペットの挿入
          for (const snippet of bodySnippets) {
            if (snippet.position === "append") {
              body.append(snippet.content);
            } else {
              body.prepend(snippet.content);
            }
            logSnippetInsertion(snippet.name, "body", filePath, snippet.priority, snippet.position);
          }
        } else {
          log("HTML", `${colors.yellow}${filePath}${colors.reset} にスニペットは挿入されません`, "info");
        }

        // 画像処理のPromiseを格納する配列
        const imagePromises = [];
        let webpConversionCount = 0;

        // 変換1: imgタグのsrc属性を変換（common以外、faviconを除く）
        $("img").each(function () {
          const src = $(this).attr("src");
          const parentLink = $(this).parent('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
          const isInHead = $(this).parents("head").length > 0;

          // 変換対象外の場合はスキップ
          if (shouldSkipImageConversion(src, isInHead) || parentLink.length > 0) {
            return;
          }

          // fetchpriority と loading 属性を追加
          const isInHeader = $(this).parents("header").length > 0;
          const isInFv = $(this).parents(".fv, .p-fv").length > 0;
          
          if (isInHeader || isInFv) {
            // header または .fv 内の画像には fetchpriority="high" を付与
            $(this).attr("fetchpriority", "high");
          } else {
            // その他の画像には loading="lazy" を付与
            $(this).attr("loading", "lazy");
          }

          // 対象の拡張子を持つ場合のみ変換
          if (hasConvertibleExtension(src)) {
            const newSrc = convertPathToWebP(src);
            $(this).attr("src", newSrc);
            webpConversionCount++;

            // 画像のパスを解決
            const imgPath = path.join(paths.src, src);

            // width/height属性を追加するPromise
            const dimensionPromise = getImageDimensions(imgPath).then((dimensions) => {
              if (dimensions) {
                $(this).attr("width", dimensions.width);
                $(this).attr("height", dimensions.height);
              }
            });

            imagePromises.push(dimensionPromise);
          }
        });

        // 変換2: pictureタグ内のsourceタグのsrcset属性を変換（common以外）
        $("picture source").each(function () {
          const srcset = $(this).attr("srcset");
          const isInHead = $(this).parents("head").length > 0;

          // 変換対象外の場合はスキップ
          if (shouldSkipImageConversion(srcset, isInHead)) {
            return;
          }

          // fetchpriority と loading 属性を追加（pictureタグの親要素を基準に判定）
          const isInHeader = $(this).parents("header").length > 0;
          const isInFv = $(this).parents(".fv, .p-fv").length > 0;
          
          if (isInHeader || isInFv) {
            // header または .fv 内の画像には fetchpriority="high" を付与
            $(this).attr("fetchpriority", "high");
          } else {
            // その他の画像には loading="lazy" を付与
            $(this).attr("loading", "lazy");
          }

          // 対象の拡張子を持つ場合のみ変換
          if (hasConvertibleExtension(srcset)) {
            const newSrcset = convertPathToWebP(srcset);
            $(this).attr("srcset", newSrcset);
            webpConversionCount++;

            // 画像のパスを解決
            const imgPath = path.join(paths.src, srcset);

            // width/height属性を追加するPromise
            const dimensionPromise = getImageDimensions(imgPath).then((dimensions) => {
              if (dimensions) {
                $(this).attr("width", dimensions.width);
                $(this).attr("height", dimensions.height);
              }
            });

            imagePromises.push(dimensionPromise);
          }
        });

        // WebP変換のカウント表示
        logWebPConversion(webpConversionCount, filePath);

        // headタグ内のlink要素（favicon）はスキップ
        $('head link[rel="icon"], head link[rel="shortcut icon"], head link[rel="apple-touch-icon"]').each(function () {
          const href = $(this).attr("href");
          if (href) {
            // faviconの拡張子は変換しない（元のままにする）
            log("HTML", `ファビコン変換をスキップ: ${colors.cyan}${href}`, "info");
          }
        });

        // プリロード用のlink要素を集める
        const preloadLinks = [];

        // .fv内の画像を探してプリロード用のlinkを作成
        $(".fv img, .p-fv img").each(function () {
          const src = $(this).attr("src");
          if (src) {
            preloadLinks.push(createPreloadLink(src));
          }
        });

        // .fv内のpictureタグを処理
        $(".fv picture, .p-fv picture").each(function () {
          const sources = $(this).find("source");
          const img = $(this).find("img");

          // source要素が存在する場合
          if (sources.length > 0) {
            sources.each(function () {
              const srcset = $(this).attr("srcset");
              const media = $(this).attr("media");

              if (srcset) {
                preloadLinks.push(createPreloadLink(srcset, media));
              }
            });
          }
          // source要素がない場合はimg要素を使用
          else if (img.length > 0) {
            const src = img.attr("src");
            if (src) {
              preloadLinks.push(createPreloadLink(src));
            }
          }
        });

        // プリロードリンクの数を表示
        logPreloadLinks(preloadLinks.length, filePath);

        // すべての画像処理が完了したら結果を返す
        Promise.all(imagePromises)
          .then(() => {
            // プリロードリンクがある場合、head内に追加
            if (preloadLinks.length > 0) {
              const head = $("head");

              // 各プリロードリンクを追加（各リンクを別々の行に）
              preloadLinks.forEach((link) => {
                head.append("\n    " + link);
              });
            }

            // HTML文字列を取得
            let html = $.html();

            // HTMLをフォーマット
            return formatHTML(html).then((formattedHtml) => {
              // 余分な空行を削除
              let cleanedHtml = formattedHtml.replace(/\n\s*\n/g, "\n");

              // プリロードリンクのインデントを修正
              cleanedHtml = formatPreloadLinks(cleanedHtml);

              file.contents = Buffer.from(cleanedHtml);
              log("HTML", `${colors.yellow}${filePath}${colors.reset} の整形が完了しました`, "success");
              cb(null, file);
            });
          })
          .catch((error) => {
            log("HTML", `画像処理/HTML整形エラー: ${error}`, "error");
            // エラーが発生しても処理を続行
            file.contents = Buffer.from(content);
            cb(null, file);
          });
      })
    );
  }

  // HTMLminオプションを選択（開発モードと本番モードで異なる）
  const htmlminOptions = skipMinify
    ? options.html.development // 開発モード用のオプション - コメントのみ削除
    : options.html.production; // 本番モード用の完全な圧縮オプション

  log("HTML", skipMinify ? `HTMLからコメントを削除しています` : `HTMLファイルを圧縮しています...`, "info");

  stream = stream.pipe(htmlmin(htmlminOptions).on("error", handleError));

  // 共通処理：出力先へコピーしてブラウザをリロード
  return stream.pipe(gulp.dest(paths.html.dist)).pipe(server.stream());
}

// htmlタスクをデフォルトエクスポートとしても公開
export default html;
