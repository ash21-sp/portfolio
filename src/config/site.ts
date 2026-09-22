/* ================================================================
   站点内容加载器
   ----------------------------------------------------------------
   网站文案与作品数据存放在 content/ 目录下的 JSON 文件里：
     content/profile.json  —— 基本信息、简介文案（含头像）
     content/works.json    —— 作品分类与作品
     content/fun.json      —— “好玩的”条目
     content/socials.json  —— 社交链接
     content/tools.json    —— 工具清单
   平时不需要改这个文件：运行 npm run admin 打开本地后台编辑，
   点「发布」自动提交并上线。
   ================================================================ */

import profileData from "../../content/profile.json";
import worksData from "../../content/works.json";
import funData from "../../content/fun.json";
import socialsData from "../../content/socials.json";
import toolsData from "../../content/tools.json";

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
  /** 首页「精选作品」展示标记；一个都没选时首页默认取排序前 4 个 */
  featured?: boolean;
  /** 封面是否同时展示在详情页；默认展示，设为 false 时封面只用于列表卡片 */
  showCoverInDetail?: boolean;
  /** 详情页是否展示描述文字；默认展示，纯视觉案例可关闭 */
  showDescriptionInDetail?: boolean;
  /** 详情图集是否无缝衔接（上下紧贴、无圆角边框）；默认不衔接 */
  seamlessGallery?: boolean;
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

/** content/socials.json 的结构 */
export interface SocialsData {
  /** 社交链接；tile 是无 logo 图标时的字母/图标瓦片 */
  socials: SocialLink[];
}

/** content/tools.json 的结构 */
export interface ToolsData {
  /** 工具清单；img 是 public 下图标路径 */
  tools: Tool[];
}

const profile = profileData as ProfileData;
const works = worksData as WorksData;
const fun = funData as FunData;
const socials = socialsData as unknown as SocialsData;
const tools = toolsData as ToolsData;

export const site = {
  ...profile,

  // ---- 工具清单（已迁移到 content/tools.json，见下方加载） ----

  projectCategories: works.categories,
  projects: works.projects,
  funProjects: fun.funProjects,
  socials: socials.socials,
  tools: tools.tools,
};

export type Site = typeof site;
