/* ================================================================
   站点内容加载器
   ----------------------------------------------------------------
   网站文案与作品数据存放在 content/ 目录下的 JSON 文件里：
     content/profile.json  —— 基本信息、简介文案（含头像）
     content/works.json    —— 作品分类与作品
     content/fun.json      —— “好玩的”条目
   平时不需要改这个文件：运行 npm run admin 打开本地后台编辑，
   点「发布」自动提交并上线。社交链接和工具清单不常改，仍在本文件维护。
   ================================================================ */

import profileData from "../../content/profile.json";
import worksData from "../../content/works.json";
import funData from "../../content/fun.json";

export interface BioSegment {
  text: string;
  href?: string;
}

export interface SocialLink {
  name: string;
  handle: string;
  url: string;
  /** 平台 logo 图片（public 下路径或外链，可选）；填写后替代 tile 字母瓦片 */
  logo?: string;
  /** 社交平台图标瓦片：icon 与 text 二选一（logo 未填时使用） */
  tile?: {
    bg: string;
    fg: string;
    text?: string;
    icon?: "github" | "dribbble";
  };
}

export interface Tool {
  name: string;
  /** 工具图标路径（public 下，如 "/tools/figma.png"） */
  img: string;
}

export interface Project {
  /** 详情页路径：/works/<slug>，需唯一 */
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  /** 详情页描述段落（每项一段） */
  description: string[];
  /** 在项目中承担的角色（详情页展示，可选） */
  role?: string;
  /** 封面图路径（放 public 下，如 "/works/foo.jpg"）；不填则显示排版式封面 */
  cover?: string;
  /** 详情页补充图（public 下路径数组，可选） */
  gallery?: string[];
  /** 外链（可选）；填写后卡片直接跳外链而不是站内详情页 */
  link?: string;
}

export interface FunProject {
  title: string;
  description: string;
  tags: string[];
  /** 项目 logo（public 下路径如 "/fun/xxx.png"，或外链图片地址，可选） */
  logo?: string;
  /** 在线演示地址（可选）；不填则条目不可点击 */
  url?: string;
}

/** content/profile.json 的结构 */
export interface ProfileData {
  name: string;
  logo: string;
  avatar: string;
  role: string;
  company: string;
  location: string;
  locationUrl: string;
  email: string;
  /** 名字下轮换的标语 */
  taglines: string[];
  /** SEO 描述 */
  description: string;
  /** 首页开场白（大字问候下面的一句） */
  intro: string;
  /** 关于段落；段落里的链接写法 [文字](https://…) */
  bio: BioSegment[][];
  /** 页脚备案号（没有则留空字符串） */
  icp: string;
  footerNote: string;
}

/** content/works.json 的结构 */
export interface WorksData {
  /** 作品分类；第一个分类视为「全部」入口 */
  categories: string[];
  projects: Project[];
}

/** content/fun.json 的结构 */
export interface FunData {
  funProjects: FunProject[];
}

const profile = profileData as ProfileData;
const works = worksData as WorksData;
const fun = funData as FunData;

export const site = {
  ...profile,

  // ---- 社交链接（不常改，直接维护在这里；tile 是平台图标瓦片的底色/字色） ----
  socials: [
    {
      name: "X",
      handle: "@linyizhou",
      url: "https://x.com/",
      logo: "/social/x.svg",
      tile: { bg: "#111113", fg: "#FFFFFF", text: "𝕏" },
    },
    {
      name: "小红书",
      handle: "@一舟设计日记",
      url: "https://www.xiaohongshu.com/",
      logo: "/social/xiaohongshu.svg",
      tile: { bg: "#FF2442", fg: "#FFFFFF", text: "书" },
    },
    {
      name: "GitHub",
      handle: "@linyizhou",
      url: "https://github.com/",
      tile: { bg: "#181717", fg: "#FFFFFF", icon: "github" as const },
    },
    {
      name: "抖音",
      handle: "@ALin",
      url: "https://www.douyin.com/",
      logo: "/social/douyin.svg",
      tile: { bg: "#161823", fg: "#25F4EE", text: "抖" },
    },
  ] as SocialLink[],

  // ---- 工具清单（不常改；图标放 public/tools/，img 填路径） ----
  tools: [
    { name: "Figma", img: "/tools/figma.png" },
    { name: "Codex", img: "/tools/codex.png" },
    { name: "Zcode", img: "/tools/zcode.png" },
    { name: "Photoshop", img: "/tools/photoshop.png" },
    { name: "Illustrator", img: "/tools/illustrator.png" },
    { name: "Eagle", img: "/tools/eagle.png" },
  ] as Tool[],

  projectCategories: works.categories,
  projects: works.projects,
  funProjects: fun.funProjects,
};

export type Site = typeof site;
