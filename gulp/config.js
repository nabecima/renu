/**
 * gulp/config.js - Gulpタスクの設定ファイル
 * プロジェクト全体の設定、パス、オプションを管理
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// プロジェクト設定ファイルを読み込み
let projectConfig = {
  zipFileName: "lp.zip"
};

try {
  const configPath = resolve("./project.config.json");
  const configFile = readFileSync(configPath, "utf8");
  projectConfig = { ...projectConfig, ...JSON.parse(configFile) };
} catch (error) {
  console.warn("project.config.jsonが見つからないため、デフォルト設定を使用します");
}

// プロジェクト設定をエクスポート
export { projectConfig };

// システムの実行モードを管理するオブジェクト
export const buildMode = {
  // 開発モードフラグ（true: 開発モード, false: 本番モード）
  isDevelopment: true,
  // サーブモードフラグ（true: サーバー起動, false: ビルドのみ）
  isServing: false,
  // スニペット挿入フラグ（true: 挿入する, false: 挿入しない）
  insertSnippets: true,
  // プライバシーポリシーCSS出力フラグ（true: 出力する, false: 出力しない）
  buildPrivacyPolicy: true,

  /**
   * 開発モードを設定する関数
   * @param {boolean} isDev - 開発モードかどうか
   */
  setDevelopmentMode(isDev) {
    this.isDevelopment = isDev;
    console.log(
      `ビルドモード: ${this.isDevelopment ? "開発モード" : "本番モード"}`
    );
  },

  /**
   * サーブモードを設定する関数
   * @param {boolean} isServe - サーブモードかどうか
   */
  setServingMode(isServe) {
    this.isServing = isServe;
    console.log(`サーブモード: ${this.isServing ? "オン" : "オフ"}`);
  },

  /**
   * スニペット挿入モードを設定する関数
   * @param {boolean} insert - スニペットを挿入するかどうか
   */
  setSnippetsMode(insert) {
    this.insertSnippets = insert;
    console.log(`スニペット挿入: ${this.insertSnippets ? "有効" : "無効"}`);
  },

  /**
   * プライバシーポリシーCSS出力モードを設定する関数
   * @param {boolean} build - プライバシーポリシーCSSを出力するかどうか
   */
  setPrivacyPolicyMode(build) {
    this.buildPrivacyPolicy = build;
    console.log(`プライバシーポリシーCSS: ${this.buildPrivacyPolicy ? "出力する" : "出力しない"}`);
  },

  /**
   * 現在のモードに基づいて設定を取得する
   * @param {Object} devOptions - 開発モード用の設定
   * @param {Object} prodOptions - 本番モード用の設定
   * @returns {Object} - 現在のモードに適した設定
   */
  getOptions(devOptions, prodOptions) {
    return this.isDevelopment ? devOptions : prodOptions;
  },
};

// プロジェクトのパス設定
export const paths = {
  // ソースディレクトリとビルド先ディレクトリ
  src: "./src",
  dist: "./dist",

  // HTMLファイルのパス設定
  html: {
    src: () => {
      const sources = [
        "./src/**/*.html",
        "!./src/snippets/**/*",
        "!./src/shadow-converter.html",
        "!./src/**/.DS_Store",
        "!./src/font-family-generator.html",
      ];
      if (!buildMode.buildPrivacyPolicy) {
        sources.push("!./src/privacy-policy/**/*");
      }
      return sources;
    },
    dist: "./dist",
    snippets: "./src/snippets",
  },

  // シャドウ変換ツールのパス設定
  shadowConverter: {
    src: "./src/shadow-converter.html",
    dist: "./dist",
  },

  // フォントファミリージェネレーターのパス設定
  fontFamilyGenerator: {
    src: "./src/font-family-generator.html",
    dist: "./dist",
  },

  // JavaScriptファイルのパス設定
  js: {
    src: ["./src/js/**/*.js", "!./src/js/**/.DS_Store"],
    dist: "./dist/js/",
    entry: "./src/js/main.js",
  },

  // SCSSファイルのパス設定
  scss: {
    src: () => {
      const sources = ["./src/scss/style.scss"];
      if (buildMode.buildPrivacyPolicy) {
        sources.push("./src/scss/privacy-policy.scss");
      }
      return sources;
    }, // メインエントリーポイント
    watch: ["./src/scss/**/*.scss", "!./src/scss/**/.DS_Store"], // 監視対象
    dist: "./dist/css",
  },

  // 画像ファイルのパス設定
  images: {
    src: [
      "./src/images/**/*",
      "!./src/images/**/base.png",
      "!./src/images/**/base.jpg",
      "!./src/images/**/base.jpeg",
      "!./src/images/**/.DS_Store",
    ],
    dist: "./dist/images",
    // favicon ディレクトリのパス（変換処理を行わない画像用）
    favicon: {
      src: ["./src/images/favicon/**/*", "!./src/images/favicon/**/.DS_Store"],
      dist: "./dist/images/favicon",
    },
    // 画像タイプ別の処理設定
    types: {
      // 変換対象の画像形式
      convert: ["jpg", "jpeg", "png", "gif"],
      // 変換せずにコピーのみ行う画像形式
      copyOnly: ["svg"],
    },
  },
};

// 各タスクのオプション設定
export const options = {
  // HTMLの最適化オプション
  html: {
    // 本番用設定
    production: {
      collapseWhitespace: true, // 空白を削除
      removeComments: true, // コメントを削除
      minifyCSS: true, // インラインCSSを最小化
      minifyJS: true, // インラインJSを最小化
      removeRedundantAttributes: false, // デフォルト属性を削除しない
      removeEmptyAttributes: true, // 空の属性を削除
      removeScriptTypeAttributes: false, // scriptタグのtype属性を削除しない
      removeStyleLinkTypeAttributes: false, // linkタグのtype属性を削除しない
      sortAttributes: true, // 属性をソート
      sortClassName: true, // classの並び順をソート
      collapseBooleanAttributes: true, // boolean属性を省略形にする
    },
    // 開発用設定
    development: {
      removeComments: true, // コメントは削除
      collapseWhitespace: false, // 空白は保持
      conservativeCollapse: false,
      preserveLineBreaks: true,
      removeEmptyAttributes: false,
      removeRedundantAttributes: false,
      collapseBooleanAttributes: true, // boolean属性を省略形にする
    },
  },

  // Prettier（HTML整形）のオプション
  prettier: {
    parser: "html",
    printWidth: 120,
    tabWidth: 2,
    useTabs: false,
    singleQuote: false,
    bracketSameLine: false,
    htmlWhitespaceSensitivity: "css",
    endOfLine: "lf",
  },

  // JavaScript圧縮（Terser）のオプション
  js: {
    // 本番用設定
    production: {
      compress: {
        drop_console: true, // console.log を削除
        drop_debugger: true, // debugger を削除
      },
      mangle: {
        toplevel: true, // トップレベルの変数名も短縮
      },
      output: {
        comments: false, // コメントを削除
      },
    },
  },

  // SCSS処理のオプション
  scss: {
    // 本番用設定
    production: {
      outputStyle: "compressed", // 圧縮する
    },
    // 開発用設定
    development: {
      outputStyle: "expanded", // 圧縮しない
    },
    // 共通設定
    autoprefixer: {
      cascade: false,
      grid: true,
    },
    // クリーンCSSオプション
    cleanCss: {
      level: 1, // レベル1のみ使用（基本的な圧縮のみ）
      specialComments: 0, // すべてのコメントを削除
    },
  },

  // Sharp 画像処理のオプション
  images: {
    // WebP変換のオプション
    webp: {
      quality: 80, // 品質（0-100）
      lossless: false, // 可逆圧縮を使用しない
    },
  },

  // BrowserSyncのオプション
  browserSync: {
    server: {
      baseDir: "./dist", // サーバールートディレクトリ
    },
    port: 3000, // ポート番号
    open: true, // 起動時にブラウザを開く
    notify: false, // 通知を表示しない
  },
};

// ログ出力用のANSIカラーコード
export const colors = {
  reset: "\x1b[0m",
  // テキスト色
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  // 背景色
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
  // スタイル
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underscore: "\x1b[4m",
};
