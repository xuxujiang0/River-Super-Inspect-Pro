# River Super Inspect Pro - Figma 插件安装与使用指南

本指南将帮助您将开发好的高级 Figma 插件（River Super Inspect Pro）安装到 Figma 桌面客户端中并开始使用。

## 1. 准备工作

确保您已经安装了 **Figma 桌面客户端**。Figma 网页版虽然也支持插件，但桌面客户端在开发和调试本地插件时体验更好。

## 2. 安装步骤

### 步骤一：打开 Figma 桌面客户端
启动您的 Figma 桌面应用程序，并登录您的账号。

### 步骤二：进入插件管理界面
1. 在 Figma 首页（文件浏览器），点击左上角的 **账号头像** 或 **下拉菜单**。
2. 选择 **Plugins**（插件） -> **Manage plugins...**（管理插件...）。
   *(或者在任意打开的设计文件中，点击顶部菜单栏的 `Plugins` -> `Development` -> `Import plugin from manifest...`)*

### 步骤三：导入本地插件
1. 在弹出的插件管理窗口中，找到 **Development**（开发）部分。
2. 点击 **+ New plugin**（新建插件）旁边的下拉箭头，或者直接点击 **Import plugin from manifest...**（从 manifest 导入插件...）。
3. 在弹出的文件选择对话框中，导航到您存放本插件代码的目录（即包含 `manifest.json` 的文件夹）。
4. 选中 [`manifest.json`](manifest.json) 文件，然后点击 **打开**。

### 步骤四：确认安装
导入成功后，您会在 "Development" 列表中看到名为 **River Super Inspect Pro** 的插件。这表示插件已成功安装到您的本地环境中。

## 3. 如何使用插件

1. **打开设计文件**：在 Figma 中打开任意一个设计文件（Design file）。
2. **运行插件**：
   - 右键点击画布空白处，选择 **Plugins** -> **Development** -> **River Super Inspect Pro**。
   - 或者使用快捷键 `Cmd + /` (Mac) 或 `Ctrl + /` (Windows) 打开快速搜索，输入 "River Super Inspect Pro" 并回车。
3. **体验功能**：
   - 插件面板会在界面中浮现。
   - 在画布中选中任意图层（如矩形、文本、框架等），插件面板会**实时无延迟**地显示该节点的属性（坐标、尺寸、颜色、圆角、排版等）。
   - 您可以在面板顶部的 **CSS / React / Vue** 选项卡之间无缝切换，查看不同框架下的代码。
   - 点击代码块右上角的 **Copy** 按钮，即可一键将代码复制到剪贴板，并伴有平滑的 Toast 提示。

## 4. 开发者说明（可选）

如果您需要修改插件的 TypeScript 代码 ([`code.ts`](code.ts))，请在修改后执行以下命令重新编译：

```bash
npm install
npx tsc
```

编译完成后，Figma 客户端会自动热重载（Hot Reload）插件，您无需重新导入即可看到最新效果。