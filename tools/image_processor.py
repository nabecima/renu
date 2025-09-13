#!/usr/bin/env python3
"""
画像のリサイズと分割を行うスクリプト（リファクタリング版）
可読性と処理能力を向上させた版
"""

import os
import argparse
import pyperclip
import json
from pathlib import Path
from contextlib import contextmanager
from dataclasses import dataclass
from typing import List, Tuple, Optional, Union, Iterator
from PIL import Image


@dataclass
class ImageConfig:
    """画像処理設定を管理するデータクラス"""
    pc_image_path: str
    width: Optional[int] = None
    scale: Optional[float] = None
    sp_width: Optional[int] = None
    sp_scale: Optional[float] = None
    media_query: str = "(max-width: 750px)"


@dataclass
class ImageInfo:
    """画像情報を管理するデータクラス"""
    path: str
    width: int
    height: int
    
    @classmethod
    def from_image(cls, path: str, image: Image.Image) -> 'ImageInfo':
        """PIL Imageオブジェクトから ImageInfo を作成"""
        return cls(path=path, width=image.width, height=image.height)


class PathUtils:
    """パス操作のユーティリティクラス"""
    
    @staticmethod
    def get_file_extension(image_path: str) -> str:
        """画像ファイルの拡張子を取得"""
        return Path(image_path).suffix.lower()
    
    @staticmethod
    def get_wrapper_class(image_path: str) -> Optional[str]:
        """画像パスからラッパークラス名を抽出"""
        path_parts = Path(image_path).parts
        
        try:
            images_index = path_parts.index('images')
            next_part = path_parts[images_index + 1]
            
            if next_part == 'pc' and images_index + 2 < len(path_parts):
                return path_parts[images_index + 2]
            elif next_part != 'pc':
                return next_part
        except (ValueError, IndexError):
            pass
        
        return None
    
    @staticmethod
    def is_first_view_image(image_path: str) -> bool:
        """ファーストビュー画像かどうかを判定"""
        return any(fv in image_path for fv in ['/fv/', '/FV/'])
    
    @staticmethod
    def get_sp_image_path(pc_image_path: str) -> Optional[str]:
        """PC画像パスからSP画像パスを生成"""
        if 'pc' not in pc_image_path:
            return None
        
        sp_path = pc_image_path.replace('/pc/', '/sp/')
        
        # .jpg が存在しない場合は .png を試す
        if not Path(sp_path).exists():
            sp_path = sp_path.replace('.jpg', '.png')
            if not Path(sp_path).exists():
                return None
        
        return sp_path


class ImageProcessor:
    """画像処理ロジックを管理するクラス"""
    
    DEFAULT_SCALE = 2.0
    DEFAULT_SPLIT_HEIGHT = 200
    OVERLAP_PIXELS = 10
    
    @staticmethod
    def resize_image(
        image: Image.Image, 
        target_width: Optional[int] = None, 
        scale: Optional[float] = None
    ) -> Image.Image:
        """画像をリサイズ"""
        current_width, current_height = image.size
        
        if target_width:
            resize_scale = target_width / current_width
        else:
            resize_scale = scale or ImageProcessor.DEFAULT_SCALE
        
        new_width = int(current_width * resize_scale)
        new_height = int(current_height * resize_scale)
        
        return image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    @staticmethod
    def convert_to_rgb(image: Image.Image) -> Image.Image:
        """RGBA画像をRGBに変換（白背景）"""
        if image.mode != 'RGBA':
            return image
        
        rgb_image = Image.new('RGB', image.size, (255, 255, 255))
        rgb_image.paste(image, mask=image.split()[3])
        return rgb_image
    
    @staticmethod
    def calculate_splits(image_height: int) -> int:
        """画像の高さから分割数を計算"""
        return max(1, image_height // ImageProcessor.DEFAULT_SPLIT_HEIGHT)
    
    @staticmethod
    def split_image(image: Image.Image, splits: int) -> List[Image.Image]:
        """画像を指定数に分割"""
        split_height = image.height // splits
        split_images = []
        
        for i in range(splits):
            top = (i * split_height) - (ImageProcessor.OVERLAP_PIXELS if i > 0 else 0)
            # 最後の分割では画像の実際の高さまで含める
            bottom = image.height if i == splits - 1 else (i + 1) * split_height
            
            split_img = image.crop((0, top, image.width, bottom))
            split_images.append(split_img)
        
        return split_images


class HTMLGenerator:
    """HTML生成ロジックを管理するクラス"""
    
    @staticmethod
    def create_html_tags(
        splits: int, 
        pc_image_path: str, 
        heights: List[int],
        media_query: str = "(max-width: 750px)"
    ) -> str:
        """HTMLタグを生成"""
        path_info = HTMLGenerator._parse_image_path(pc_image_path)
        wrapper_class = PathUtils.get_wrapper_class(pc_image_path)
        is_first_view = PathUtils.is_first_view_image(pc_image_path)
        is_responsive = 'pc' in Path(pc_image_path).parts
        
        # 元画像の拡張子に基づいて出力拡張子を決定
        original_ext = PathUtils.get_file_extension(pc_image_path)
        output_ext = 'png' if original_ext == '.png' else 'jpg'
        
        # 画像属性の決定
        img_attrs = ''
        
        tags = []
        
        # ラッパーの開始タグ
        if wrapper_class:
            tags.append(f'<div class="{wrapper_class}">')
        
        # 画像タグの生成
        for i in range(1, splits + 1):
            if is_responsive:
                tag = HTMLGenerator._create_responsive_tag(
                    path_info, i, heights[i-1], img_attrs, output_ext, media_query
                )
            else:
                tag = HTMLGenerator._create_simple_tag(
                    path_info, i, heights[i-1], img_attrs, output_ext
                )
            tags.append(tag)
        
        # ラッパーの終了タグ
        if wrapper_class:
            tags.append('</div>')
        
        return '\n'.join(tags)
    
    @staticmethod
    def _parse_image_path(pc_image_path: str) -> dict:
        """画像パスを解析してパス情報を取得"""
        parts = Path(pc_image_path).parts
        
        if 'pc' in parts:
            pc_index = parts.index('pc')
            base_path = '/'.join(parts[:pc_index])
            sub_dir = '/'.join(parts[pc_index+1:-1])
        else:
            images_index = parts.index('images')
            base_path = '/'.join(parts[:images_index+1])
            sub_dir = '/'.join(parts[images_index+1:-1])
        
        relative_path = "." + base_path[base_path.find("/images"):]
        
        return {
            'relative_path': relative_path,
            'sub_dir': sub_dir
        }
    
    @staticmethod
    def _create_responsive_tag(path_info: dict, index: int, height: int, img_attrs: str, output_ext: str, media_query: str = "(max-width: 750px)") -> str:
        """レスポンシブ画像タグを生成"""
        relative_path = path_info['relative_path']
        sub_dir = path_info['sub_dir']
        
        return f'''<picture style="--h: {height / 2};">
  <source srcset="{relative_path}/sp/{sub_dir}/{index}.{output_ext}" media="{media_query}" />
  <img src="{relative_path}/pc/{sub_dir}/{index}.{output_ext}" alt=""{img_attrs} />
</picture>'''
    
    @staticmethod
    def _create_simple_tag(path_info: dict, index: int, height: int, img_attrs: str, output_ext: str) -> str:
        """シンプル画像タグを生成"""
        relative_path = path_info['relative_path']
        sub_dir = path_info['sub_dir']
        
        img_path = f"{relative_path}/{sub_dir}/{index}.{output_ext}" if sub_dir else f"{relative_path}/{index}.{output_ext}"
        return f'<img src="{img_path}" style="--h: {height / 2};" alt=""{img_attrs} />'


class ImageSplitter:
    """メイン画像分割処理クラス"""
    
    def __init__(self, config: ImageConfig):
        self.config = config
        self._validate_config()
    
    def _validate_config(self) -> None:
        """設定の妥当性をチェック"""
        if not Path(self.config.pc_image_path).exists():
            raise FileNotFoundError(f"画像が見つかりません: {self.config.pc_image_path}")
    
    def process(self) -> None:
        """メイン処理"""
        with self._load_images() as (pc_image, sp_image):
            pc_info = self._process_pc_image(pc_image)
            sp_info = self._process_sp_image(sp_image) if sp_image else None
            
            splits = ImageProcessor.calculate_splits(pc_info.height)
            
            split_heights = self._split_and_save_images(pc_info, sp_info, splits)
            self._generate_html_output(splits, split_heights)
    
    @contextmanager
    def _load_images(self) -> Iterator[Tuple[Image.Image, Optional[Image.Image]]]:
        """画像ファイルを安全に読み込む"""
        pc_image = Image.open(self.config.pc_image_path)
        sp_image = None
        
        try:
            sp_path = PathUtils.get_sp_image_path(self.config.pc_image_path)
            if sp_path:
                sp_image = Image.open(sp_path)
            
            yield pc_image, sp_image
        finally:
            pc_image.close()
            if sp_image:
                sp_image.close()
    
    def _process_pc_image(self, image: Image.Image) -> ImageInfo:
        """PC画像を処理"""
        original_info = ImageInfo.from_image(self.config.pc_image_path, image)
        print(f"PC画像 元のサイズ: {original_info.width}x{original_info.height}")
        
        resized_image = ImageProcessor.resize_image(image, self.config.width, self.config.scale)
        resized_info = ImageInfo.from_image(self.config.pc_image_path, resized_image)
        print(f"PC画像 新しいサイズ: {resized_info.width}x{resized_info.height}")
        
        return resized_info
    
    def _process_sp_image(self, image: Image.Image) -> Optional[ImageInfo]:
        """SP画像を処理"""
        if not image:
            return None
        
        original_info = ImageInfo.from_image("", image)
        print(f"SP画像 元のサイズ: {original_info.width}x{original_info.height}")
        
        resized_image = ImageProcessor.resize_image(image, self.config.sp_width, self.config.sp_scale)
        resized_info = ImageInfo.from_image("", resized_image)
        print(f"SP画像 新しいサイズ: {resized_info.width}x{resized_info.height}")
        
        return resized_info
    
    def _split_and_save_images(
        self, 
        pc_info: ImageInfo, 
        sp_info: Optional[ImageInfo], 
        splits: int
    ) -> List[int]:
        """画像を分割して保存"""
        with self._load_images() as (pc_image, sp_image):
            # 画像をリサイズ
            pc_resized = ImageProcessor.resize_image(pc_image, self.config.width, self.config.scale)
            sp_resized = None
            if sp_image:
                sp_resized = ImageProcessor.resize_image(sp_image, self.config.sp_width, self.config.sp_scale)
            
            # 分割
            pc_splits = ImageProcessor.split_image(pc_resized, splits)
            sp_splits = ImageProcessor.split_image(sp_resized, splits) if sp_resized else []
            
            # 保存
            return self._save_split_images(pc_splits, sp_splits)
    
    def _save_split_images(
        self, 
        pc_splits: List[Image.Image], 
        sp_splits: List[Image.Image]
    ) -> List[int]:
        """分割画像を保存"""
        pc_dir = Path(self.config.pc_image_path).parent
        sp_dir = None
        
        # 元画像の拡張子を取得
        original_ext = PathUtils.get_file_extension(self.config.pc_image_path)
        output_ext = '.png' if original_ext == '.png' else '.jpg'
        
        if sp_splits:
            sp_path = PathUtils.get_sp_image_path(self.config.pc_image_path)
            if sp_path:
                sp_dir = Path(sp_path).parent
                sp_dir.mkdir(parents=True, exist_ok=True)
        
        split_heights = []
        
        for i, pc_split in enumerate(pc_splits, 1):
            # PC画像保存
            if output_ext == '.png':
                # PNG形式で保存（透明度を保持）
                pc_split.save(pc_dir / f"{i}.png")
            else:
                # JPG形式で保存（RGB変換）
                pc_rgb = ImageProcessor.convert_to_rgb(pc_split)
                pc_rgb.save(pc_dir / f"{i}.jpg")
            
            # SP画像保存
            if sp_splits and i <= len(sp_splits):
                if output_ext == '.png':
                    sp_splits[i-1].save(sp_dir / f"{i}.png")
                else:
                    sp_rgb = ImageProcessor.convert_to_rgb(sp_splits[i-1])
                    sp_rgb.save(sp_dir / f"{i}.jpg")
            
            split_heights.append(pc_split.height)
        
        return split_heights
    
    def _generate_html_output(self, splits: int, split_heights: List[int]) -> None:
        """HTML出力を生成"""
        html_tags = HTMLGenerator.create_html_tags(
            splits, 
            self.config.pc_image_path, 
            split_heights,
            self.config.media_query
        )
        
        pyperclip.copy(html_tags)
        
        # 結果表示
        print(f"\n{splits}分割のHTMLタグをクリップボードにコピーしました。")
    


def create_argument_parser() -> argparse.ArgumentParser:
    """コマンドライン引数パーサーを作成"""
    parser = argparse.ArgumentParser(description='画像のリサイズと分割を行います（リファクタリング版）')
    parser.add_argument('image_path', help='処理するPC用画像のパス')

    # リサイズ関連の引数
    main_group = parser.add_mutually_exclusive_group()
    main_group.add_argument('--width', type=int, help='目標横幅')
    main_group.add_argument('--scale', type=float, help='倍率（デフォルト: 2.0）')

    sp_group = parser.add_mutually_exclusive_group()
    sp_group.add_argument('--sp-width', type=int, help='SP画像の目標横幅（PC画像の場合のみ）')
    sp_group.add_argument('--sp-scale', type=float, help='SP画像の倍率（PC画像の場合のみ、デフォルト: 2.0）')

    parser.add_argument('--media', type=str, default='(max-width: 750px)', help='pictureタグのsourceのmedia属性（デフォルト: (max-width: 750px)）')
    parser.add_argument('--config', type=str, help='設定ファイルのパス（JSON形式）')

    return parser


def load_config_file(config_path: str) -> dict:
    """設定ファイルを読み込む"""
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"設定ファイルが見つかりません: {config_path}")
        return {}
    except json.JSONDecodeError as e:
        print(f"設定ファイルの形式が正しくありません: {e}")
        return {}


def merge_config(args: argparse.Namespace, config_data: dict) -> ImageConfig:
    """コマンドライン引数と設定ファイルをマージして設定を作成"""
    # 設定ファイルの値を優先し、なければコマンドライン引数の値を使用
    return ImageConfig(
        pc_image_path=args.image_path,
        width=config_data.get('width', args.width),
        scale=config_data.get('scale', args.scale),
        sp_width=config_data.get('sp_width', args.sp_width),
        sp_scale=config_data.get('sp_scale', args.sp_scale),
        media_query=config_data.get('media', args.media)
    )


def main():
    """メイン関数"""
    parser = create_argument_parser()
    args = parser.parse_args()

    # 設定ファイルの読み込み
    config_data = {}
    if args.config:
        config_data = load_config_file(args.config)
    
    # 設定をマージ
    config = merge_config(args, config_data)

    try:
        splitter = ImageSplitter(config)
        splitter.process()
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        exit(1)


if __name__ == '__main__':
    main()