#!/bin/bash

# Set up colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   Python仮想環境をアクティブ化中...   ${NC}"
echo -e "${BLUE}=========================================${NC}"

source myenv/bin/activate

echo -e "${GREEN}✓ Python仮想環境をアクティブ化しました${NC}"
echo -e "\n利用可能なPythonスクリプト:"
echo -e "  ${YELLOW}cd tools && python image_processor.py [画像パス]${NC} - 画像分割"
echo -e "\n${YELLOW}終了するには 'deactivate' と入力してください${NC}"
