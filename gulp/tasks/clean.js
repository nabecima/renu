/**
 * gulp/tasks/clean.js - ビルド前に出力ディレクトリを削除するタスク
 * ビルド開始前に指定されたディレクトリをクリーンアップ
 */

import { deleteAsync } from "del";
import { paths } from "../config.js";
import { log } from "../utils.js";

/**
 * 出力ディレクトリを削除するタスク
 * 新しいビルドの前に古いファイルを完全に削除する
 * @returns {Promise} - 削除処理のPromise
 */
export function clean() {
  log("クリーン", `出力ディレクトリを削除します: ${paths.dist}`, "info");

  return deleteAsync([paths.dist])
    .then((deletedPaths) => {
      if (deletedPaths.length > 0) {
        log("クリーン", `${deletedPaths.length} 個のファイル/ディレクトリを削除しました`, "success");
      } else {
        log("クリーン", "削除するファイルはありませんでした", "info");
      }
    })
    .catch((error) => {
      log("クリーン", `削除中にエラーが発生しました: ${error.message}`, "error");
    });
}
