# 便签与待办 · dsh-keep-notes

Keep 风格的便签、按日历排布的待办清单，以及 GitHub 风格的活动热力图。整个功能独立占据 DSH 左侧栏的一个页面。

![深色主题](https://raw.githubusercontent.com/wiills/dsh-keep-notes/main/docs/screenshots/dark.png)

![浅色主题](https://raw.githubusercontent.com/wiills/dsh-keep-notes/main/docs/screenshots/light.png)

## 功能

- **按日历排布的待办**：默认展示 7 天，今天列自动加宽高亮；可一键展开整月视图，再缩回 7 天。
- **全局待办**：固定在最左侧，不随选中日期变化。
- **两类便签**：日历便签跟随选中日期，全局便签常驻；最右侧还有一栏固定便签，随手记一笔。
- **活动热力图**：GitHub 同款绿色梯度，16 周 × 7 天，带 0–4 图例。
- **顶部迷你月历**：显示整月、今天与有待办的日期，点一下跳到那天。
- **外观设置**：标题栏、待办区、便签区可分别设置背景图，遮罩强度可调。
- **主题与配色**：跟随 DSH 深色/浅色主题；便签提供黄、绿、蓝、紫、红五色（Microsoft To Do 色板）。
- **中英文界面**：跟随 DSH 语言切换。

## 安装

### 从插件市场安装

1. 在 DSH 中启用实验性插件市场组合包 `@deepseek-ai/dsh-experimental-plugin-market-bundle`；
2. 打开 **Plugins → Discover → Index sources**，添加索引地址：

   ```
   https://wiills.github.io/dsh-keep-notes/index.json
   ```

3. 搜索「便签」或「notes」，安装后刷新页面。

### 直接安装

在 Plugins 页面的安装对话框中输入包名：

```
dsh-keep-notes@1.0.0
```

## 使用

- **今天 / 7 天 / 月视图**：标题栏工具行切换；「缩回」回到默认的 7 天布局。
- **新建待办**：点任意日期列底部的「+ 待办」。
- **完成待办**：点左侧圆圈；双击文字可以改名。
- **新建便签**：点「+ 新建便签」；便签底部圆点切换颜色。
- **固定便签**：最右栏，输入即自动保存。
- **设置**：标题栏左下角的齿轮，可换背景图、调遮罩强度。

## 数据与隐私

- 全部数据保存在浏览器 `localStorage`：`dsh.keep-notes.board.v1`、`dsh.keep-notes.appearance.v1`。
- 背景图在本机压缩（最长边 ≤ 1440px 的 JPEG）后写入 `localStorage`，不会上传。
- 插件不发起任何网络请求，不收集遥测。

## 兼容性

- DSH `^0.2.1-rc.5`（见 `package.json` 的 `engines.dsh`）。
- Web 端；便签底色依赖 `color-mix()`，需要 Edge / Chrome 111+。

## 开发

```bash
npm run check          # node --check
npm pack --dry-run     # 查看发布内容
npm run validate:index # 校验 docs/index.json（需先 npm install）
```

本地预览：把仓库目录作为 bundle 安装（`plugin_manager` 的 `install_bundle`），或在发布后从 npm 安装。

## 发布新版本

1. `npm version patch`（或 `minor` / `major`）；
2. `npm publish`（仓库已配置 `publishConfig.registry`，发布到 npmjs）；
3. 在 `docs/index.json` 的 `versions[]` 顶部加一条新版本，`publishTimestamp` 用发布时间（Unix 秒）；
4. `npm run validate:index`；
5. `git push`，GitHub Pages 会自动更新索引。

## License

MIT © 2026 wiills

---

## English

Keep-style notes, calendar-based todos and a GitHub-style activity heatmap, rendered as a standalone DSH sidebar page.

- Todos laid out per calendar day: a 7-day view by default, expandable to a full month; today's column is wider and highlighted.
- A global todo column pinned to the left, independent of the selected date.
- Calendar notes follow the selected day, global notes stay put, and a fixed note rail sits on the far right.
- GitHub-style 16 × 7 activity heatmap, a mini month calendar, and per-section background images.
- Follows the DSH dark/light theme; five note colors from the Microsoft To Do palette; zh/en UI.

Install by adding the index `https://wiills.github.io/dsh-keep-notes/index.json` in **Plugins → Discover → Index sources**, or install `dsh-keep-notes@1.0.0` directly.

All data stays in `localStorage`; the plugin makes no network requests.
