/**
 * gulp/tasks/scripts.js - JavaScriptタスク
 * WebpackによるJavaScriptのバンドル処理
 */

import gulp from "gulp";
import webpack from "webpack-stream";
import TerserPlugin from "terser-webpack-plugin";
import { paths, options, buildMode, colors } from "../config.js";
import { server, log, handleError } from "../utils.js";

/**
 * JavaScriptタスク（Webpackを使用）
 * @returns {NodeJS.ReadWriteStream} - Gulpストリーム
 */
export function js() {
  // サーブモードの場合のみsourcemapを出力
  const useSourcemaps = buildMode.isServing;

  // サーブモードの場合のみ圧縮しない（開発モードでも圧縮する）
  const skipMinify = buildMode.isServing;

  log(
    "JavaScript",
    `Webpackでの処理: ${
      skipMinify
        ? `${colors.green}サーブモード（ソースマップあり、圧縮なし）`
        : buildMode.isDevelopment
          ? `${colors.cyan}開発モード（圧縮あり${useSourcemaps ? "、ソースマップあり" : ""}）`
          : `${colors.blue}本番モード（圧縮あり）`
    }`,
    "info"
  );

  // 本番モード時のみTerserプラグインの設定を適用
  const optimization = skipMinify
    ? {}
    : {
        minimizer: [
          new TerserPlugin({
            terserOptions: options.js.production,
            extractComments: false
          })
        ]
      };

  return gulp
    .src(paths.js.entry)
    .pipe(
      webpack({
        mode: skipMinify ? "development" : "production",
        entry: {
          main: paths.js.entry
        },
        output: {
          filename: "main.js"
        },
        module: {
          rules: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: ["@babel/preset-env"]
                }
              }
            },
            {
              test: /\.css$/,
              use: ["style-loader", "css-loader"]
            }
          ]
        },
        // 開発環境では source-map を出力、本番では出力しない
        devtool: useSourcemaps ? "source-map" : false,
        // 本番環境では最適化を有効に
        optimization: optimization
      }).on("error", handleError)
    )
    .pipe(gulp.dest(paths.js.dist, { sourcemaps: useSourcemaps ? "." : false }))
    .pipe(server.stream());
}

// jsタスクをデフォルトエクスポートとしても公開
export default js;
