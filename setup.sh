#!/bin/bash

# Set up colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   LP制作特化Gulpテンプレート          ${NC}"
echo -e "${BLUE}   プロジェクトセットアップスクリプト    ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo -e "${YELLOW}スライス画像コーディングに最適化されたビルドシステム${NC}"
echo -e "${YELLOW}FLOCSS + Container Query + CSSO圧縮対応${NC}\n"

# Step 1: Check for existing Git repository and ask for confirmation
echo -e "\n${YELLOW}ステップ 1: 既存のGitリポジトリをチェック...${NC}"
if [ -d ".git" ]; then
  echo -e "${YELLOW}既存の.gitディレクトリが見つかりました。${NC}"
  echo -e "${RED}⚠️  注意: Gitリポジトリを削除すると、既存のコミット履歴が失われます。${NC}"
  echo -e "${BLUE}   テンプレートの更新作業中の場合は削除しないことをお勧めします。${NC}"
  echo ""
  
  while true; do
    read -p "既存のGitリポジトリを削除しますか？ (y/N): " choice
    case $choice in
      [Yy]* ) 
        rm -rf .git
        echo -e "${GREEN}✓ 既存の.gitディレクトリを削除しました${NC}"
        INIT_GIT=true
        break;;
      [Nn]* | "" ) 
        echo -e "${BLUE}ℹ️  既存のGitリポジトリを保持します${NC}"
        INIT_GIT=false
        break;;
      * ) 
        echo -e "${RED}y (はい) または n (いいえ) で答えてください。${NC}";;
    esac
  done
else
  echo -e "${GREEN}✓ 既存の.gitディレクトリはありません${NC}"
  INIT_GIT=true
fi

# Step 2: Remove .gitkeep files (except in src/images directory)
echo -e "\n${YELLOW}ステップ 2: .gitkeepファイルを削除（src/images内は除く）...${NC}"
gitkeep_files=$(find . -name ".gitkeep" -type f -not -path "./src/images/*")
gitkeep_count=0

if [ -z "$gitkeep_files" ]; then
  echo -e "${GREEN}✓ 削除対象の.gitkeepファイルはありません${NC}"
else
  while IFS= read -r file; do
    rm "$file"
    gitkeep_count=$((gitkeep_count + 1))
    echo "  削除: $file"
  done <<< "$gitkeep_files"
  echo -e "${GREEN}✓ $gitkeep_count個の.gitkeepファイルを削除しました${NC}"
fi

# Check if src/images has .gitkeep files
images_gitkeep=$(find ./src/images -name ".gitkeep" -type f 2>/dev/null)
if [ -n "$images_gitkeep" ]; then
  echo -e "${BLUE}ℹ️  src/images内の.gitkeepファイルは保持されました${NC}"
fi

# Step 2.5: Ask for LP type and create folder structure
echo -e "\n${YELLOW}ステップ 2.5: LPタイプの選択...${NC}"
echo -e "${BLUE}制作するLPのタイプを選択してください:${NC}"
echo -e "  ${YELLOW}1) SPのみ${NC} - スマートフォン専用LP"
echo -e "  ${YELLOW}2) PC+SP${NC} - PC・スマートフォン両対応LP"
echo ""

while true; do
  read -p "LPタイプを選択してください (1 または 2): " lp_type
  case $lp_type in
    1 ) 
      echo -e "${GREEN}✓ SPのみのLPを選択しました${NC}"
      LP_TYPE="sp_only"
      break;;
    2 ) 
      echo -e "${GREEN}✓ PC+SPのLPを選択しました${NC}"
      LP_TYPE="pc_sp"
      break;;
    * ) 
      echo -e "${RED}1 (SPのみ) または 2 (PC+SP) を選択してください。${NC}";;
  esac
done

# Create folder structure based on LP type
echo -e "\n${YELLOW}フォルダ構造を作成中...${NC}"

if [ "$LP_TYPE" = "sp_only" ]; then
  # SP only structure: fv, a1-a10, cta directly in images
  echo -e "${BLUE}SPのみのフォルダ構造を作成します...${NC}"
  
  # Create fv folder
  mkdir -p "src/images/fv"
  touch "src/images/fv/.gitkeep"
  echo "  作成: src/images/fv/"
  
  # Create a1-a10 folders
  for i in {1..10}; do
    folder_name="a$i"
    mkdir -p "src/images/$folder_name"
    touch "src/images/$folder_name/.gitkeep"
    echo "  作成: src/images/$folder_name/"
  done
  
  # Create cta folder
  mkdir -p "src/images/cta"
  touch "src/images/cta/.gitkeep"
  echo "  作成: src/images/cta/"
  
  echo -e "${GREEN}✓ SPのみのフォルダ構造を作成しました${NC}"
  
elif [ "$LP_TYPE" = "pc_sp" ]; then
  # PC+SP structure: pc and sp folders, each with fv, a1-a10, and cta
  echo -e "${BLUE}PC+SPのフォルダ構造を作成します...${NC}"
  
  # Create PC folder structure
  mkdir -p "src/images/pc/fv"
  touch "src/images/pc/fv/.gitkeep"
  echo "  作成: src/images/pc/fv/"
  
  for i in {1..10}; do
    folder_name="a$i"
    mkdir -p "src/images/pc/$folder_name"
    touch "src/images/pc/$folder_name/.gitkeep"
    echo "  作成: src/images/pc/$folder_name/"
  done
  
  # Create PC cta folder
  mkdir -p "src/images/pc/cta"
  touch "src/images/pc/cta/.gitkeep"
  echo "  作成: src/images/pc/cta/"
  
  # Create SP folder structure
  mkdir -p "src/images/sp/fv"
  touch "src/images/sp/fv/.gitkeep"
  echo "  作成: src/images/sp/fv/"
  
  for i in {1..10}; do
    folder_name="a$i"
    mkdir -p "src/images/sp/$folder_name"
    touch "src/images/sp/$folder_name/.gitkeep"
    echo "  作成: src/images/sp/$folder_name/"
  done
  
  # Create SP cta folder
  mkdir -p "src/images/sp/cta"
  touch "src/images/sp/cta/.gitkeep"
  echo "  作成: src/images/sp/cta/"
  
  echo -e "${GREEN}✓ PC+SPのフォルダ構造を作成しました${NC}"
fi

# Step 2.6: Ask for privacy policy page creation
echo -e "\n${YELLOW}ステップ 2.6: プライバシーポリシーページの作成...${NC}"

while true; do
  read -p "プライバシーポリシーページを作成しますか？ (y/N): " privacy_choice
  case $privacy_choice in
    [Yy]* ) 
      echo -e "${GREEN}✓ プライバシーポリシーページを作成します${NC}"
      CREATE_PRIVACY_POLICY=true
      break;;
    [Nn]* | "" ) 
      echo -e "${GREEN}✓ プライバシーポリシーページは作成しません${NC}"
      CREATE_PRIVACY_POLICY=false
      break;;
    * ) 
      echo -e "${RED}y (はい) または n (いいえ) で答えてください。${NC}";;
  esac
done

# Step 2.7: Configure breakpoints
echo -e "\n${YELLOW}ステップ 2.7: ブレークポイントの設定...${NC}"
echo -e "${BLUE}プロジェクトで使用するブレークポイントを設定します。${NC}"

if [ "$LP_TYPE" = "sp_only" ]; then
  echo -e "${BLUE}SPのみのLPのため、smブレークポイントのみ設定します。${NC}"
  echo -e "${BLUE}現在の設定: sm: 750${NC}"
else
  echo -e "${BLUE}現在の設定: sm: 750, content: 1100, lg: 2000${NC}"
fi
echo ""

while true; do
  read -p "ブレークポイントをカスタマイズしますか？ (y/N): " breakpoint_choice
  case $breakpoint_choice in
    [Yy]* ) 
      echo -e "\n${YELLOW}ブレークポイントの設定を開始します...${NC}"
      echo -e "${BLUE}数値のみを入力してください（px単位は自動で追加されます）${NC}"
      
      # Get sm breakpoint
      while true; do
        read -p "smブレークポイント (デフォルト: 750): " sm_value
        if [[ -z "$sm_value" ]]; then
          SM_BREAKPOINT_NUM="750"
          break
        elif [[ $sm_value =~ ^[0-9]+$ ]]; then
          SM_BREAKPOINT_NUM="$sm_value"
          break
        else
          echo -e "${RED}数値のみを入力してください（例: 750）${NC}"
        fi
      done
      
      if [ "$LP_TYPE" = "pc_sp" ]; then
        # Get content breakpoint (only for PC+SP)
        while true; do
          read -p "contentブレークポイント (デフォルト: 1100): " content_value
          if [[ -z "$content_value" ]]; then
            CONTENT_BREAKPOINT_NUM="1100"
            break
          elif [[ $content_value =~ ^[0-9]+$ ]]; then
            CONTENT_BREAKPOINT_NUM="$content_value"
            break
          else
            echo -e "${RED}数値のみを入力してください（例: 1100）${NC}"
          fi
        done
        
        # Get lg breakpoint (only for PC+SP)
        while true; do
          read -p "lgブレークポイント (デフォルト: 2000): " lg_value
          if [[ -z "$lg_value" ]]; then
            LG_BREAKPOINT_NUM="2000"
            break
          elif [[ $lg_value =~ ^[0-9]+$ ]]; then
            LG_BREAKPOINT_NUM="$lg_value"
            break
          else
            echo -e "${RED}数値のみを入力してください（例: 2000）${NC}"
          fi
        done
        
        echo -e "\n${GREEN}✓ ブレークポイントを設定しました:${NC}"
        echo -e "  sm: ${YELLOW}${SM_BREAKPOINT_NUM}px${NC}"
        echo -e "  content: ${YELLOW}${CONTENT_BREAKPOINT_NUM}px${NC}"
        echo -e "  lg: ${YELLOW}${LG_BREAKPOINT_NUM}px${NC}"
      else
        # SP only - set default values for content and lg
        CONTENT_BREAKPOINT_NUM="1100"
        LG_BREAKPOINT_NUM="2000"
        echo -e "\n${GREEN}✓ ブレークポイントを設定しました:${NC}"
        echo -e "  sm: ${YELLOW}${SM_BREAKPOINT_NUM}px${NC}"
        echo -e "  content: ${YELLOW}${CONTENT_BREAKPOINT_NUM}px${NC} (コメントアウト)"
        echo -e "  lg: ${YELLOW}${LG_BREAKPOINT_NUM}px${NC} (コメントアウト)"
      fi
      
      CUSTOMIZE_BREAKPOINTS=true
      break;;
    [Nn]* | "" ) 
      echo -e "${GREEN}✓ デフォルトのブレークポイントを使用します${NC}"
      SM_BREAKPOINT_NUM="750"
      CONTENT_BREAKPOINT_NUM="1100"
      LG_BREAKPOINT_NUM="2000"
      CUSTOMIZE_BREAKPOINTS=false
      break;;
    * ) 
      echo -e "${RED}y (はい) または n (いいえ) で答えてください。${NC}";;
  esac
done

# Step 3: Initialize a new Git repository (if needed)
if [ "$INIT_GIT" = true ]; then
  echo -e "\n${YELLOW}ステップ 3: 新しいGitリポジトリを初期化...${NC}"
  git init
  echo -e "${GREEN}✓ Gitリポジトリを初期化しました${NC}"
else
  echo -e "\n${BLUE}ステップ 3: Gitリポジトリの初期化をスキップしました${NC}"
fi

# Step 4: Create Python virtual environment
echo -e "\n${YELLOW}ステップ 4: Python仮想環境を作成...${NC}"
if [ -d "myenv" ]; then
  echo -e "${YELLOW}既存の仮想環境が見つかりました。削除して再作成します...${NC}"
  rm -rf myenv
fi

python3 -m venv myenv
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Python仮想環境を作成しました${NC}"
else
  echo -e "${RED}✗ Python仮想環境の作成に失敗しました${NC}"
  echo -e "${YELLOW}python3-venvがインストールされているか確認してください:${NC}"
  echo -e "${YELLOW}sudo apt-get install python3-venv (Debian/Ubuntu)${NC}"
  echo -e "${YELLOW}brew install python3 (macOS)${NC}"
  exit 1
fi

# Step 5: Activate virtual environment and install Python dependencies
echo -e "\n${YELLOW}ステップ 5: 仮想環境をアクティブ化してPythonパッケージをインストール...${NC}"
source myenv/bin/activate

# Install Python dependencies from tools directory
echo -e "${YELLOW}Pythonパッケージをインストールします...${NC}"
if [ -f "tools/requirements.txt" ]; then
  pip install -r tools/requirements.txt
else
  echo -e "${RED}✗ tools/requirements.txtが見つかりません${NC}"
  exit 1
fi
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Pythonパッケージをインストールしました${NC}"
else
  echo -e "${RED}✗ Pythonパッケージのインストールに失敗しました${NC}"
  exit 1
fi

# Deactivate virtual environment
deactivate

# Step 6: Install npm dependencies
echo -e "\n${YELLOW}ステップ 6: npmパッケージをインストール...${NC}"
echo -e "ネットワーク環境によっては数分かかる場合があります...\n"
npm install

# Check if npm install was successful
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}✓ npmパッケージをインストールしました${NC}"
else
  echo -e "\n${RED}✗ npmパッケージのインストール中にエラーが発生しました。npmのログを確認してください。${NC}"
  exit 1
fi

# Create activation script
echo -e "\n${YELLOW}ステップ 7: 仮想環境アクティベーションスクリプトを作成...${NC}"
cat > activate.sh << 'EOF'
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
EOF
chmod +x activate.sh
echo -e "${GREEN}✓ activate.shを作成しました${NC}"

# Step 7: Update package.json scripts based on privacy policy choice
echo -e "\n${YELLOW}ステップ 7: package.jsonのスクリプトを更新...${NC}"

# Create backup of package.json
cp package.json package.json.backup

if [ "$CREATE_PRIVACY_POLICY" = true ]; then
  # Update scripts to include privacy policy by default
  if command -v jq &> /dev/null; then
    # Use jq if available for precise JSON manipulation
    jq '.scripts.serve = "gulp serve" | 
        .scripts.dev = "gulp dev" | 
        .scripts.build = "gulp build"' package.json > package.json.tmp && mv package.json.tmp package.json
    echo -e "${GREEN}✓ package.jsonのスクリプトを更新しました（jq使用）${NC}"
  else
    # Fallback to sed for systems without jq
    sed 's/"serve": "gulp serve --no-privacy-policy"/"serve": "gulp serve"/' package.json | \
    sed 's/"dev": "gulp dev --no-privacy-policy"/"dev": "gulp dev"/' | \
    sed 's/"build": "gulp build --no-privacy-policy"/"build": "gulp build"/' > package.json.tmp && mv package.json.tmp package.json
    echo -e "${GREEN}✓ package.jsonのスクリプトを更新しました（sed使用）${NC}"
  fi
  
  echo -e "${BLUE}ℹ️  プライバシーポリシーページありのプロジェクトとして設定されました${NC}"
  echo -e "${BLUE}ℹ️  必要に応じて --no-privacy-policy オプションで無効化できます${NC}"
else
  # Update scripts to exclude privacy policy by default
  if command -v jq &> /dev/null; then
    # Use jq if available for precise JSON manipulation
    jq '.scripts.serve = "gulp serve --no-privacy-policy" | 
        .scripts.dev = "gulp dev --no-privacy-policy" | 
        .scripts.build = "gulp build --no-privacy-policy"' package.json > package.json.tmp && mv package.json.tmp package.json
    echo -e "${GREEN}✓ package.jsonのスクリプトを更新しました（jq使用）${NC}"
  else
    # Fallback to sed for systems without jq
    sed 's/"serve": "gulp serve"/"serve": "gulp serve --no-privacy-policy"/' package.json | \
    sed 's/"dev": "gulp dev"/"dev": "gulp dev --no-privacy-policy"/' | \
    sed 's/"build": "gulp build"/"build": "gulp build --no-privacy-policy"/' > package.json.tmp && mv package.json.tmp package.json
    echo -e "${GREEN}✓ package.jsonのスクリプトを更新しました（sed使用）${NC}"
  fi
  
  echo -e "${BLUE}ℹ️  プライバシーポリシーページなしのプロジェクトとして設定されました${NC}"
  echo -e "${BLUE}ℹ️  必要に応じて --privacy-policy オプションで有効化できます${NC}"
fi

# Step 7.5: Update breakpoints in _variables.scss if customized
if [ "$CUSTOMIZE_BREAKPOINTS" = true ]; then
  echo -e "\n${YELLOW}ステップ 7.5: ブレークポイントを_variables.scssに適用...${NC}"
  
  # Create backup of _variables.scss
  cp src/scss/foundation/_variables.scss src/scss/foundation/_variables.scss.backup
  
  if [ "$LP_TYPE" = "sp_only" ]; then
    # SP only: Update sm and comment out content/lg in both sections
    # Update $breakpoints section
    sed -i.tmp "s/  sm: [0-9][0-9]*px,/  sm: ${SM_BREAKPOINT_NUM}px,/" src/scss/foundation/_variables.scss
    sed -i.tmp "s/  content: [0-9][0-9]*px,/  \/\/ content: ${CONTENT_BREAKPOINT_NUM}px,/" src/scss/foundation/_variables.scss
    sed -i.tmp "s/  lg: [0-9][0-9]*px,/  \/\/ lg: ${LG_BREAKPOINT_NUM}px,/" src/scss/foundation/_variables.scss
    # Update already commented lines in $container-breakpoints section
    sed -i.tmp "s/  \/\/ content: [0-9][0-9]*px,/  \/\/ content: ${CONTENT_BREAKPOINT_NUM}px,/" src/scss/foundation/_variables.scss
    sed -i.tmp "s/  \/\/ lg: [0-9][0-9]*px,/  \/\/ lg: ${LG_BREAKPOINT_NUM}px,/" src/scss/foundation/_variables.scss
    echo -e "${GREEN}✓ _variables.scssのブレークポイントを更新しました（SPのみ）${NC}"
    echo -e "${BLUE}ℹ️  content と lg はコメントアウトされました${NC}"
  else
    # PC+SP: Update all breakpoints in both sections
    # First uncomment any commented lines (for cases where switching from SP to PC+SP)
    sed -i.tmp "s/  \/\/ content: [0-9][0-9]*px,/  content: ${CONTENT_BREAKPOINT_NUM}px,/" src/scss/foundation/_variables.scss
    sed -i.tmp "s/  \/\/ lg: [0-9][0-9]*px,/  lg: ${LG_BREAKPOINT_NUM}px,/" src/scss/foundation/_variables.scss
    # Then update all values
    sed -i.tmp "s/  sm: [0-9][0-9]*px,/  sm: ${SM_BREAKPOINT_NUM}px,/" src/scss/foundation/_variables.scss
    sed -i.tmp "s/  content: [0-9][0-9]*px,/  content: ${CONTENT_BREAKPOINT_NUM}px,/" src/scss/foundation/_variables.scss
    sed -i.tmp "s/  lg: [0-9][0-9]*px,/  lg: ${LG_BREAKPOINT_NUM}px,/" src/scss/foundation/_variables.scss
    echo -e "${GREEN}✓ _variables.scssのブレークポイントを更新しました（PC+SP）${NC}"
  fi
  
  # Remove temporary files
  rm -f src/scss/foundation/_variables.scss.tmp
  
  echo -e "${BLUE}ℹ️  バックアップファイル: _variables.scss.backup${NC}"
else
  echo -e "\n${BLUE}ステップ 7.5: デフォルトのブレークポイントを保持します${NC}"
fi

# Step 7.6: Update image processor config based on breakpoints
if [ "$CUSTOMIZE_BREAKPOINTS" = true ]; then
  echo -e "\n${YELLOW}ステップ 7.6: 画像プロセッサ設定を更新...${NC}"
  
  # Create backup of image_processor_config.json
  cp tools/image_processor_config.json tools/image_processor_config.json.backup
  
  if [ "$LP_TYPE" = "sp_only" ]; then
    # SP only: width = sm * 2, remove sp_width, sp_scale, media
    WIDTH_VALUE=$((SM_BREAKPOINT_NUM * 2))
    cat > tools/image_processor_config.json << EOF
{
  "width": $WIDTH_VALUE,
  "scale": 2.0
}
EOF
    echo -e "${GREEN}✓ 画像プロセッサ設定を更新しました（SPのみ）${NC}"
    echo -e "${BLUE}ℹ️  width: ${WIDTH_VALUE} (sm: ${SM_BREAKPOINT_NUM} × 2)${NC}"
  else
    # PC+SP: width = lg * 2, sp_width = sm * 2, media = sm
    WIDTH_VALUE=$((LG_BREAKPOINT_NUM * 2))
    SP_WIDTH_VALUE=$((SM_BREAKPOINT_NUM * 2))
    cat > tools/image_processor_config.json << EOF
{
  "width": $WIDTH_VALUE,
  "scale": 2.0,
  "sp_width": $SP_WIDTH_VALUE,
  "sp_scale": 2.0,
  "media": "(max-width: ${SM_BREAKPOINT_NUM}px)"
}
EOF
    echo -e "${GREEN}✓ 画像プロセッサ設定を更新しました（PC+SP）${NC}"
    echo -e "${BLUE}ℹ️  width: ${WIDTH_VALUE} (lg: ${LG_BREAKPOINT_NUM} × 2)${NC}"
    echo -e "${BLUE}ℹ️  sp_width: ${SP_WIDTH_VALUE} (sm: ${SM_BREAKPOINT_NUM} × 2)${NC}"
    echo -e "${BLUE}ℹ️  media: (max-width: ${SM_BREAKPOINT_NUM}px)${NC}"
  fi
  
  echo -e "${BLUE}ℹ️  バックアップファイル: image_processor_config.json.backup${NC}"
else
  echo -e "\n${BLUE}ステップ 7.6: 画像プロセッサ設定を保持します${NC}"
fi

# Setup complete
echo -e "\n${BLUE}=========================================${NC}"
echo -e "${GREEN}セットアップが完了しました！${NC}"
echo -e "${BLUE}=========================================${NC}"

echo -e "\n${YELLOW}仮想環境が作成されました。以下のコマンドで有効化できます:${NC}"
echo -e "  ${GREEN}source myenv/bin/activate${NC}"

echo -e "\n使用可能なコマンド:"
echo -e "  ${YELLOW}cd tools && python image_processor.py [画像ファイルパス] [オプション]${NC} - 画像分割スクリプトを実行（仮想環境内で）"
echo -e "  ${YELLOW}npm run serve${NC}      - 開発サーバーを起動（BrowserSync、ポート3000）"
echo -e "  ${YELLOW}npm run dev${NC}        - 開発用ビルド（ソースマップなし、圧縮なし）"
echo -e "  ${YELLOW}npm run build${NC}      - 本番用ビルド（CSSO圧縮、最適化済み）"
echo -e "  ${YELLOW}npm run test${NC}       - テストビルド（スニペット挿入なし）\n"

echo -e "主な機能:"
echo -e "  ${GREEN}✓${NC} FLOCSS アーキテクチャベースのSCSS構成"
echo -e "  ${GREEN}✓${NC} レスポンシブデザイン対応（コンテナクエリ + メディアクエリ）"
echo -e "  ${GREEN}✓${NC} 自動WebP変換（高品質画像最適化）"
echo -e "  ${GREEN}✓${NC} CSSOによる安全なCSS圧縮"
echo -e "  ${GREEN}✓${NC} HTML/JavaScript最適化"
echo -e "  ${GREEN}✓${NC} スニペット自動挿入システム"
echo -e "  ${GREEN}✓${NC} 自動ZIP生成機能"
echo -e "  ${GREEN}✓${NC} シャドウ変換ツール"
echo -e "  ${GREEN}✓${NC} フォントファミリージェネレーター\n"