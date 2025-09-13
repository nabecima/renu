# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run serve` - Start development server with live reload (BrowserSync on port 3000)
- `npm run dev` - Build for development (with source maps, unminified)
- `npm run build` - Build for production (minified, optimized)
- `npm run test` - Test build without snippets insertion
- `npm run build -- --no-snippets` - Build without inserting HTML snippets
- `npm run build -- --no-privacy-policy` - Build without including privacy policy page

Individual Gulp tasks can be run directly:
- `gulp clean` - Clean dist directory
- `gulp html` - Process HTML files
- `gulp js` - Process JavaScript files
- `gulp scss` - Process SCSS files
- `gulp images` - Process and optimize images
- `gulp shadowConverter` - Generate shadow converter tool

## Architecture

This is a Gulp-based frontend build system for landing pages with modular task organization.

### Build System Structure
- **gulpfile.js** - Main Gulp configuration with dev/build/serve tasks
- **gulp/config.js** - Central configuration with build modes, paths, and options
- **gulp/tasks/** - Individual task modules (clean, html, images, scripts, styles, serve)
- **gulp/utils.js** - Shared utilities and logging functions
- **project.config.json** - Project-specific settings (ZIP filename, etc.)

### Build Modes
The system supports three build modes managed by `buildMode` object:
- **Development mode** (`isDevelopment: true`) - Unminified output, source maps
- **Production mode** (`isDevelopment: false`) - Minified, optimized output
- **Serve mode** (`isServing: true`) - Enables BrowserSync and file watching

### Source Structure
- **src/scss/** - SCSS files using FLOCSS methodology (Foundation/Layout/Object)
  - `foundation/` - Base styles, variables, mixins, functions
  - `layout/` - Layout-specific styles
  - `object/component/` - Reusable UI components
  - `object/project/` - Project-specific components
  - `object/utility/` - Utility classes
- **src/js/** - Modular JavaScript architecture with optional features
  - `modules/` - Feature modules (lazy loaders, smooth scroll)
  - `utils/` - Shared utilities (debounce, throttle, DOM helpers)
  - `main.js` - Entry point with commented-out features for selective enabling
- **src/images/** - Images with automatic WebP conversion (except `common/` directory)
- **src/snippets/** - HTML snippets for head/body injection based on config.json
- **src/privacy-policy/** - Privacy policy page template with semantic HTML structure

### JavaScript Module System
The JavaScript architecture uses a modular design where features can be selectively enabled:
- **LazyYouTubeLoader** - Lazy loading for YouTube videos using data-src attributes
- **LazyGoogleMapLoader** - Lazy loading for Google Maps (iframe-based, no API key required)
- **ResponsiveSmoothScroll** - Smooth scrolling for anchor links
- **Utils** - Performance utilities (debounce, throttle, DOM helpers)

All modules are commented out by default in `main.js`. Refer to `src/js/README.md` for feature activation guidelines.

### Key Features
- **Snippet injection system** - Automatically injects head/body snippets based on config
- **Image optimization** - Converts images to WebP format while preserving originals
- **SCSS compilation** - Supports modern SCSS with autoprefixer and CSSO compression
- **JavaScript bundling** - Uses Webpack for module bundling
- **Shadow converter tool** - Special utility for CSS shadow conversion
- **Privacy policy management** - Optional privacy policy page with command-line control
- **LP type selection** - Setup script supports SP-only or PC+SP folder structures
- **Git-friendly images folder** - Empty folders tracked with .gitkeep files

### File Processing
- HTML files are processed with snippet insertion and minification
- SCSS compiled to CSS with autoprefixer and CSSO compression (replaces CleanCSS)
- JavaScript bundled through Webpack with optional minification
- Images optimized and converted to WebP format automatically
- Files in `src/images/common/` are copied without conversion
- Privacy policy page can be excluded from builds using `--no-privacy-policy` flag
- Empty image folders (containing only .gitkeep) are excluded from distribution
- ZIP file creation with customizable filename via `project.config.json`

## Privacy Policy Management

The template includes an optional privacy policy page system:

### Setup Configuration
- Run `setup.sh` to configure LP type and privacy policy creation
- Choose between SP-only or PC+SP folder structures for images
- Select whether to include privacy policy page (y/N prompt)
- Package.json scripts are automatically modified based on selections

### Privacy Policy Control
- **Include privacy policy**: Default behavior includes privacy policy in builds
- **Exclude privacy policy**: Use `--no-privacy-policy` flag with any build command
- **Template content**: Generic placeholder content suitable for any business
- **Semantic HTML**: Uses proper HTML5 semantic elements (header, article, address, footer)
- **Responsive design**: Mobile-first approach with standard Japanese fonts

### File Structure
- `src/privacy-policy/index.html` - Privacy policy page template
- `src/scss/pages/_privacy-policy.scss` - Dedicated SCSS styling
- Template uses placeholder company information (株式会社〇〇) for easy customization

## Project Configuration

The template includes a `project.config.json` file for customizing project-specific settings:

### ZIP File Configuration
By default, builds create `lp.zip`. To change the ZIP filename:

```json
{
  "zipFileName": "my-project.zip",
  "description": "プロジェクト設定ファイル - ZIPファイル名などの設定を管理"
}
```

**Usage:**
- Edit `project.config.json` in the project root
- Change `zipFileName` to your desired filename
- Run `npm run dev` or `npm run build` to create ZIP with new name
- If the config file is missing, defaults to `lp.zip`
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.