# 安全记事本 / Secure Notepad

> 🇨🇳 中文 | [🇬🇧 English](#english)

一个纯前端、本地运行的加密记事本应用。所有笔记数据经 AES-GCM 加密后存储，支持密码保护、日历视图、富文本编辑、附件、待办提醒，并内置思维导图、流程图、代码编辑器与目录比较同步工具。无需服务器，直接用浏览器打开 `index.html` 即可使用。

---

## ✨ 功能特性

### 核心笔记
- **加密存储**：笔记内容使用 Web Crypto（AES-GCM + PBKDF2）加密后存入 IndexedDB，首次使用设置密码，之后每次打开需解锁
- **日历视图**：按日期浏览笔记，标记有笔记 / 有提醒 / 有待办的日期，可折叠
- **笔记列表**：置顶、拖拽排序、搜索（笔记/待办两种模式）
- **富文本编辑器**：加粗、标题、列表、对齐、文字/高亮颜色、超链接、注释、图片（可拖拽缩放）、表格（可插入与调整行列）、悬浮格式工具栏
- **附件管理**：上传、预览（图片/PDF/文本）、下载、删除，附件同样加密存储
- **待办任务**：从笔记内容一键生成待办，支持截止时间、完成状态、按截止/创建/全部三种视图
- **提醒**：定时提醒，支持弹窗、提示音、系统通知三种方式
- **导出**：Markdown / Word / PDF / 全部笔记合并导出

### 可视化工具（顶栏一键切换）
- **思维导图**：树状布局、框选多选、整组拖拽、自动对齐、平移/缩放
- **流程图**：丰富形状库、自动连线、框选整组拖拽、对齐参考线、连线橡皮擦、导出 PNG
- **代码编辑器**：多语言语法高亮、保存为笔记附件
- **目录比较与同步**：选择本地两个目录进行对比（仅一侧有 / 不一致 / 相同），逐条或一键批量同步，支持回退操作

### 个性化与系统
- **主题**：清新绿 / 炫酷现代 两套主题
- **中英文切换**：设置按钮右侧的语言按钮（EN / 中），选择自动记忆，下次打开保留
- **数据存储方案**：浏览器存储（IndexedDB）或 SQLite 文件存储（可绑定本地数据文件、初始化数据库、备份）
- **界面定制**：可隐藏统计卡片、枫叶背景装饰及各工具入口按钮

---

## 📁 目录结构

```
notepad/
├── index.html              # 主页面（登录、笔记、日历、编辑器、设置）
├── css/
│   └── style.css           # 全局样式与主题变量
├── js/
│   ├── app.js              # 应用主逻辑（笔记 CRUD、日历、编辑器、同步）
│   ├── crypto.js           # 加密模块（AES-GCM / PBKDF2）
│   ├── db.js               # IndexedDB 存储层
│   ├── sqlite-store.js     # SQLite 文件存储（File System Access API）
│   ├── i18n.js             # 中英双语模块（词典 + 语言切换）
│   └── vendor/             # sql.js（wasm 已内嵌 base64，适配 file:// 协议）
├── mind/
│   └── mind.html           # 思维导图（内嵌 iframe 加载）
├── flow/
│   └── flow.html           # 流程图（内嵌 iframe 加载）
├── code/
│   ├── code-editor.html    # 代码编辑器
│   └── vendor/             # highlight.js 及语言包
├── assets/                 # 图标资源
└── db/data/                # SQLite 数据文件默认目录
```

---

## 🚀 使用方法

1. 用现代浏览器（Chrome / Edge 推荐）直接打开 `index.html`
2. 首次使用设置密码；之后每次打开输入密码解锁（可在设置中关闭密码保护）
3. 点击顶栏图标可切换思维导图、流程图、代码编辑器、目录比较与同步
4. 语言切换：点击设置齿轮右侧的 **EN / 中** 按钮

> 💡 目录选择、SQLite 文件绑定等功能依赖 File System Access API，请使用 Chrome / Edge；以 `file://` 方式直接打开即可，无需部署服务器。

---

## 🔐 数据安全说明

- 笔记与附件在写入存储前整体加密，密钥由密码经 PBKDF2 派生，密码本身不落盘
- 「浏览器存储」方案数据保存在浏览器 IndexedDB 中，清除浏览器数据会导致丢失，建议绑定 SQLite 数据文件或定期备份
- 「SQLite 存储」方案将数据库保存为本地文件，可复制到任意位置备份

---

---

<a id="english"></a>

# Secure Notepad 🇬🇧

A fully client-side, locally running encrypted notepad application. All notes are encrypted with AES-GCM before being stored. It supports password protection, a calendar view, rich-text editing, attachments, and todo reminders, with built-in mind map, flowchart, code editor, and directory compare & sync tools. No server required — just open `index.html` in your browser.

---

## ✨ Features

### Core Notes
- **Encrypted storage**: Note content is encrypted with Web Crypto (AES-GCM + PBKDF2) and stored in IndexedDB. Set a password on first use; unlock with it on every launch
- **Calendar view**: Browse notes by date, with markers for notes / reminders / todos; collapsible
- **Note list**: Pinning, drag-to-reorder, search (notes / todos modes)
- **Rich-text editor**: Bold, headings, lists, alignment, text/highlight colors, hyperlinks, annotations, images (drag-to-resize), tables (insert, resize rows/columns), floating format toolbar
- **Attachments**: Upload, preview (image / PDF / text), download, delete — attachments are encrypted too
- **Todos**: Generate todos from note content in one click, with due time, done state, and due / created / all views
- **Reminders**: Scheduled reminders via popup, sound, and system notification
- **Export**: Markdown / Word / PDF / merge all notes into one file

### Visual Tools (one-click switch from the top bar)
- **Mind map**: Tree layout, marquee multi-select, group drag, auto alignment, pan & zoom
- **Flowchart**: Rich shape library, auto-connect, marquee group drag, alignment guides, connection eraser, PNG export
- **Code editor**: Multi-language syntax highlighting, save as note attachment
- **Directory compare & sync**: Compare two local folders (left-only / right-only / different / identical), sync per item or all at once, with undo support

### Personalization & System
- **Themes**: Fresh Green / Modern
- **Language switch**: The language button (EN / 中) next to the settings gear — your choice is remembered across sessions
- **Storage options**: Browser storage (IndexedDB) or SQLite file storage (bind a local data file, initialize database, back up)
- **UI customization**: Hide the stats cards, maple-leaf decoration, or any tool entry button

---

## 📁 Project Structure

```
notepad/
├── index.html              # Main page (login, notes, calendar, editor, settings)
├── css/
│   └── style.css           # Global styles & theme variables
├── js/
│   ├── app.js              # Main app logic (note CRUD, calendar, editor, sync)
│   ├── crypto.js           # Crypto module (AES-GCM / PBKDF2)
│   ├── db.js               # IndexedDB storage layer
│   ├── sqlite-store.js     # SQLite file storage (File System Access API)
│   ├── i18n.js             # Chinese-English i18n module (dictionary + switching)
│   └── vendor/             # sql.js (wasm embedded as base64 for file:// protocol)
├── mind/
│   └── mind.html           # Mind map (loaded in an embedded iframe)
├── flow/
│   └── flow.html           # Flowchart (loaded in an embedded iframe)
├── code/
│   ├── code-editor.html    # Code editor
│   └── vendor/             # highlight.js and language packs
├── assets/                 # Icon assets
└── db/data/                # Default directory for the SQLite data file
```

---

## 🚀 Getting Started

1. Open `index.html` in a modern browser (Chrome / Edge recommended)
2. Set a password on first use; unlock with it afterwards (password protection can be disabled in Settings)
3. Click the top-bar icons to switch between mind map, flowchart, code editor, and directory compare & sync
4. Language: click the **EN / 中** button to the right of the settings gear

> 💡 Folder picking and SQLite file binding rely on the File System Access API — please use Chrome / Edge. Opening via `file://` works directly; no deployment needed.

---

## 🔐 Data Security Notes

- Notes and attachments are encrypted as a whole before being written to storage; the key is derived from your password via PBKDF2, and the password itself is never stored
- With the "Browser Storage" option, data lives in the browser's IndexedDB — clearing browser data will erase it. Binding a SQLite data file or backing up regularly is recommended
- With the "SQLite Storage" option, the database is saved as a local file that you can copy anywhere for backup
