# 纸上档案馆 · 个人官网

UI 设计师的个人网站：「左右双栏工作台」版式——桌面端左侧固定身份栏（头像/名字/导航/社交），右侧独立滚动的内容区；黑白基底 + 克莱因蓝 `#2F52E0` 单点缀色，等宽字体，亮/暗双主题。

技术栈：Next.js 15（App Router）· Tailwind CSS v4 · next-themes · lucide-react

**不需要自己的服务器**：内容存在 GitHub 仓库里，网站由 Vercel 免费托管；本地后台改完内容一键发布即可上线。

## 日常更新内容（最常用）

```bash
npm run admin        # 启动本地后台（3210 端口）
```

打开 <http://localhost:3210/admin>：

1. 在「作品 / 首页与简介 / 好玩的 / 社交链接 / 工具清单」五个标签页里编辑、传图；
2. 点 **保存** —— 写入本地内容文件，预览（<http://localhost:3210/>）立即生效；
3. 点 **发布上线** —— 自动提交并推送到 GitHub，Vercel 约 1–2 分钟后自动构建上线。

> 后台只在本机运行，线上站点没有 `/admin` 页面；发布只会提交 `content/` 和 `public/` 的改动，代码里改了一半的东西不会被带上去。

## 内容放在哪里

| 位置 | 内容 |
| --- | --- |
| `content/profile.json` | 名字、头像、头衔、简介文案、页脚等 |
| `content/works.json` | 作品分类 + 全部作品 |
| `content/fun.json` | 「好玩的」条目 |
| `content/socials.json` | 社交链接（平台名、账号、跳转网址、图标） |
| `content/tools.json` | 工具清单（工具名、图标） |
| `public/works/`、`public/fun/`、`public/social/`、`public/tools/` | 后台上传的封面、图集、图标 |
| `src/config/site.ts` | 类型定义 + 内容加载器 |

页面全部从 `src/config/site.ts` 导出的 `site` 对象取数，一般不用动代码。首页「精选作品」展示在后台勾选了「首页精选」的作品（建议 4 件，两列排列）；一件都没勾时默认展示排序最前的 4 件。

## 首次部署（只需做一次）

### 1. 配置 git 署名（首次使用 git 才需要）

```bash
git config --global user.name "你的名字"
git config --global user.email "you@example.com"
```

### 2. 在 GitHub 建一个空仓库

打开 <https://github.com/new> → 起个名字（如 `portfolio`）→ **不要**勾选任何初始化选项（README / .gitignore 都不要）→ Create。

### 3. 关联并推送

```bash
git remote add origin git@github.com:<你的用户名>/portfolio.git   # 或 https://github.com/<你的用户名>/portfolio.git
git push -u origin main
```

> 第一次推送时 GitHub 会要求登录：HTTPS 方式会弹出浏览器授权，SSH 方式需要先配好密钥。推送成功后再到后台点一次「发布上线」，以后就一键直达。

### 4. 接入 Vercel（免费托管）

1. 打开 [vercel.com/new](https://vercel.com/new)，用 GitHub 账号登录；
2. Import 刚才的仓库，Framework 自动识别为 Next.js，直接点 **Deploy**；
3. 完成后得到 `xxx.vercel.app` 域名；以后每次推送（包括后台点「发布上线」）都会自动更新网站；
4. 有自己的域名的话，在 Vercel 项目的 Settings → Domains 里绑定。

## 本地开发

```bash
npm install         # 首次安装依赖
npm run dev         # 仅预览/开发网站（3000 端口）
npm run admin       # 后台 + 预览（3210 端口）
npm run build       # 生产构建
npm run start       # 运行生产构建
```

## 几个注意点

- **作品的 slug**（详情页地址 `/works/<slug>`）保存后尽量不要再改，改了等于换网址；
- 图片支持 png / jpg / webp / gif / svg / avif，单张 ≤ 10MB；删除作品或换封面后，不再使用的图片会在保存时自动清理；
- **作品防盗**：后台上传的作品图（封面/图集）会自动烧入浅色平铺水印（头像和图标不加），并剥离 EXIF/GPS 信息；全站图片禁用右键另存与拖拽。这些只能提高窃取成本，无法阻止截图。存量图片可在后台「作品 → 图片保护」一键补水印（只跑一次，重复跑会叠加）；
- 「全部」是固定的筛选入口（分类列表第一项），删不掉；删除还有作品在用的分类时，作品本身不受影响；
- 以后想随时随地（手机上）改内容，可以在此基础上接入在线 CMS（如 Decap CMS），内容结构不用推翻。

## 自定义主题色

点缀色在 `src/app/globals.css` 的 CSS 变量里：

- 亮色 `:root` → `--accent: #2f52e0`
- 暗色 `.dark` → `--accent: #7a93ff`（暗色下自动提亮保证对比度）

纸张底色、墨色、发丝线、点阵的浓度也在同一处变量区调整。左栏宽度在 `site-chrome.tsx`（`w-[320px]`）与 `page-shell.tsx`（`lg:ml-[320px]`）两处，改时保持一致。

## 目录结构

```
content/               # ★ 网站内容（后台读写的就是这五个文件）
├── profile.json       #   基本信息、简介文案
├── works.json         #   作品分类与作品
├── fun.json           #   「好玩的」条目
├── socials.json       #   社交链接
└── tools.json         #   工具清单
src/
├── app/               # 路由：/（首页）、/works、/works/[slug]、/fun、/admin（仅本地）
│   ├── admin/         #   本地后台界面
│   ├── api/admin/     #   后台 API（读写字内容/上传图片/发布，生产环境 404）
│   ├── layout.tsx     # 字体（JetBrains Mono）、主题 Provider、SEO metadata
│   ├── globals.css    # 全部设计令牌（颜色/纹理/动效）
│   └── works/page.tsx
├── components/
│   ├── site-chrome.tsx # 左侧固定身份栏 + 移动端顶栏/身份块
│   ├── lede.tsx        # 首页开场（大字问候 + meta 行）
│   ├── section.tsx     # 章节容器（mono 小引 + 中文大标题）
│   ├── project-card.tsx / project-grid.tsx
│   ├── command-palette.tsx / theme-toggle.tsx / back-to-top.tsx
│   └── …
├── config/site.ts      # 内容加载器 + 类型（社交链接、工具清单在这里）
└── lib/admin.ts        # 后台的服务端工具（校验、图片清理等）
public/                 # 头像、作品图片、工具/社交图标
```

## 交互与快捷键

- `⌘K` / `Ctrl+K`：命令面板（跳转页面、切换主题、复制邮箱）
- 点击邮箱一键复制；右下角回到顶部
- 亮/暗主题跟随系统，可手动切换并记忆
