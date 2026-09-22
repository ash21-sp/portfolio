/* ================================================================
   本地后台的服务端工具：dev-only 守卫、内容读写、校验、图片清理
   后台 API 只在本地开发模式（npm run admin）下可用，
   生产构建里所有 /api/admin/* 一律 404，不会部署到线上。
   ================================================================ */

import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type {
  FunData,
  FunProject,
  ProfileData,
  Project,
  SocialLink,
  SocialsData,
  Tool,
  ToolsData,
  WorksData,
} from "@/config/site";

export type AdminSection = "profile" | "works" | "fun" | "socials" | "tools";

/** 生产环境一律 404；返回 null 表示放行 */
export function ensureLocalAdmin(): NextResponse | null {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "后台只能在本地使用：在项目目录运行 npm run admin" },
      { status: 404 },
    );
  }
  return null;
}

const CONTENT_DIR = path.join(process.cwd(), "content");
const PUBLIC_DIR = path.join(process.cwd(), "public");

const SECTION_FILES = {
  profile: "profile.json",
  works: "works.json",
  fun: "fun.json",
  socials: "socials.json",
  tools: "tools.json",
} as const satisfies Record<AdminSection, string>;

export async function readSection<T>(section: AdminSection): Promise<T> {
  const raw = await fs.readFile(
    path.join(CONTENT_DIR, SECTION_FILES[section]),
    "utf8",
  );
  return JSON.parse(raw) as T;
}

export async function writeSection(
  section: AdminSection,
  data: unknown,
): Promise<void> {
  const file = path.join(CONTENT_DIR, SECTION_FILES[section]);
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

/* ---------------- 校验 ---------------- */

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
// slug 会成为 /works/<slug> 路由，避开站点已有路径
const RESERVED_SLUGS = new Set(["works", "fun", "admin", "api"]);

const isStr = (v: unknown): v is string => typeof v === "string";
const isStrArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(isStr);

export function validateProfile(p: ProfileData): string[] {
  if (!p) return ["基本信息数据缺失"];
  const errors: string[] = [];
  const need = (cond: boolean, msg: string) => {
    if (!cond) errors.push(msg);
  };
  need(isStr(p.name) && !!p.name.trim(), "名字不能为空");
  need(isStr(p.logo) && !!p.logo.trim(), "页眉字符标不能为空");
  need(isStr(p.avatar) && p.avatar.startsWith("/"), "头像路径需要以 / 开头");
  need(isStr(p.role) && !!p.role.trim(), "头衔不能为空");
  need(isStr(p.company), "公司/身份需要为文本");
  need(isStr(p.location), "地点需要为文本");
  need(isStr(p.locationUrl), "地图链接需要为文本");
  need(isStr(p.email) && !!p.email.trim(), "邮箱不能为空");
  need(isStrArray(p.taglines), "轮换标语需要是文本列表");
  need(isStr(p.description), "SEO 描述需要为文本");
  need(isStr(p.intro), "开场白需要为文本");
  if (!Array.isArray(p.bio)) {
    errors.push("简介段落格式不正确");
  } else {
    p.bio.forEach((para, i) => {
      if (!Array.isArray(para)) {
        errors.push(`简介第 ${i + 1} 段格式不正确`);
        return;
      }
      para.forEach((seg, j) => {
        if (!seg || !isStr(seg.text)) {
          errors.push(`简介第 ${i + 1} 段第 ${j + 1} 个片段需要是文本`);
        } else if (seg.href !== undefined && !isStr(seg.href)) {
          errors.push(`简介第 ${i + 1} 段第 ${j + 1} 个片段的链接需要是文本`);
        }
      });
    });
  }
  need(isStr(p.icp), "备案号需要为文本");
  need(isStr(p.footerNote), "页脚注记需要为文本");
  return errors;
}

export function validateWorks(w: WorksData): string[] {
  if (!w) return ["作品数据缺失"];
  const errors: string[] = [];
  if (!isStrArray(w.categories) || w.categories.length === 0) {
    return ["至少需要保留一个作品分类"];
  }
  const seen = new Set<string>();
  (Array.isArray(w.projects) ? w.projects : []).forEach((raw, i) => {
    const proj = (raw ?? {}) as Project;
    const label = isStr(proj?.title) && proj.title.trim() ? proj.title : `第 ${i + 1} 个作品`;
    if (!isStr(proj.slug) || !SLUG_RE.test(proj.slug)) {
      errors.push(`「${label}」的 slug 只能用小写字母、数字、短横线（如 maxintel）`);
    } else if (RESERVED_SLUGS.has(proj.slug)) {
      errors.push(`「${label}」的 slug 不能占用保留名：${proj.slug}`);
    } else if (seen.has(proj.slug)) {
      errors.push(`slug「${proj.slug}」重复了，每个作品需要唯一的 slug`);
    }
    seen.add(proj.slug);
    if (!isStr(proj.title) || !proj.title.trim()) errors.push(`第 ${i + 1} 个作品缺少标题`);
    if (!isStr(proj.subtitle)) errors.push(`「${label}」缺少副标题`);
    if (!isStr(proj.category) || !proj.category.trim()) errors.push(`「${label}」还没有选择分类`);
    if (!isStr(proj.year) || !proj.year.trim()) errors.push(`「${label}」缺少年份`);
    if (!isStrArray(proj.description)) errors.push(`「${label}」的描述需要是多段文本`);
    if (proj.role !== undefined && !isStr(proj.role)) errors.push(`「${label}」的角色需要是文本`);
    if (proj.cover !== undefined && !(isStr(proj.cover) && proj.cover.startsWith("/"))) {
      errors.push(`「${label}」的封面路径需要以 / 开头`);
    }
    if (proj.gallery !== undefined && !isStrArray(proj.gallery)) {
      errors.push(`「${label}」的图集格式不正确`);
    }
    if (proj.link !== undefined && !isStr(proj.link)) errors.push(`「${label}」的外链需要是文本`);
    if (proj.featured !== undefined && typeof proj.featured !== "boolean") {
      errors.push(`「${label}」的首页精选标记格式不正确`);
    }
  });
  return errors;
}

export function validateFun(f: FunData): string[] {
  if (!f) return ["好玩的条目数据缺失"];
  const errors: string[] = [];
  if (!Array.isArray(f.funProjects)) return ["好玩的条目格式不正确"];
  f.funProjects.forEach((raw, i) => {
    const item = (raw ?? {}) as FunProject;
    const label = isStr(item?.title) && item.title.trim() ? item.title : `第 ${i + 1} 条`;
    if (!isStr(item.title) || !item.title.trim()) errors.push(`「${label}」缺少标题`);
    if (!isStr(item.description)) errors.push(`「${label}」缺少描述`);
    if (!isStrArray(item.tags)) errors.push(`「${label}」的标签需要是文本列表`);
    if (item.logo !== undefined && !isStr(item.logo)) errors.push(`「${label}」的 logo 路径需要是文本`);
    if (item.url !== undefined && !isStr(item.url)) errors.push(`「${label}」的演示地址需要是文本`);
  });
  return errors;
}

export function validateSocials(s: SocialsData): string[] {
  if (!s) return ["社交链接数据缺失"];
  const errors: string[] = [];
  if (!Array.isArray(s.socials)) return ["社交链接格式不正确"];
  s.socials.forEach((raw, i) => {
    const item = (raw ?? {}) as SocialLink;
    const label = isStr(item?.name) && item.name.trim() ? item.name : `第 ${i + 1} 个链接`;
    if (!isStr(item.name) || !item.name.trim()) errors.push(`「${label}」缺少平台名（如 小红书）`);
    if (!isStr(item.handle)) errors.push(`「${label}」缺少账号名`);
    if (!isStr(item.url) || !item.url.trim()) {
      errors.push(`「${label}」缺少跳转链接`);
    } else if (!/^(https?:\/\/|\/)/.test(item.url.trim())) {
      errors.push(`「${label}」的跳转链接要以 http(s):// 开头`);
    }
    if (item.logo !== undefined && !isStr(item.logo)) errors.push(`「${label}」的图标路径需要是文本`);
    if (item.tile !== undefined && item.tile !== null) {
      const t = item.tile as Record<string, unknown>;
      if (!isStr(t.bg) || !isStr(t.fg)) errors.push(`「${label}」的图标瓦片需要底色和字色`);
      if (t.icon !== undefined && !isStr(t.icon)) errors.push(`「${label}」的瓦片图标需要是文本`);
      if (t.text !== undefined && !isStr(t.text)) errors.push(`「${label}」的瓦片文字需要是文本`);
    }
  });
  return errors;
}

export function validateTools(t: ToolsData): string[] {
  if (!t) return ["工具清单数据缺失"];
  const errors: string[] = [];
  if (!Array.isArray(t.tools)) return ["工具清单格式不正确"];
  t.tools.forEach((raw, i) => {
    const item = (raw ?? {}) as Tool;
    const label = isStr(item?.name) && item.name.trim() ? item.name : `第 ${i + 1} 个工具`;
    if (!isStr(item.name) || !item.name.trim()) errors.push(`「${label}」缺少工具名`);
    if (!isStr(item.img) || !item.img.startsWith("/")) {
      errors.push(`「${label}」还没有上传图标`);
    }
  });
  return errors;
}

/* ---------------- 不再引用的图片清理 ---------------- */

/** 收集各份数据里引用到的、位于 public 下的资源路径 */
function collectAssetRefs(data: {
  profile: ProfileData;
  works: WorksData;
  fun: FunData;
  socials: SocialsData;
  tools: ToolsData;
}): Set<string> {
  const refs = new Set<string>();
  const add = (p: unknown) => {
    if (isStr(p) && p.startsWith("/")) refs.add(p);
  };
  add(data.profile?.avatar);
  (data.works?.projects ?? []).forEach((p) => {
    add(p.cover);
    (p.gallery ?? []).forEach(add);
  });
  (data.fun?.funProjects ?? []).forEach((f) => add(f.logo));
  (data.socials?.socials ?? []).forEach((s) => add(s.logo));
  (data.tools?.tools ?? []).forEach((t: Tool) => add(t.img));
  return refs;
}

/**
 * 保存后清理「之前被引用、现在不再被引用」的后台上传图片。
 * 只删 /works/、/fun/、/social/、/tools/ 下、文件名由后台上传规则生成的文件；
 * avatar 等手工维护的资源一律不动。
 */
export async function cleanupOrphanAssets(
  oldData: {
    profile: ProfileData;
    works: WorksData;
    fun: FunData;
    socials: SocialsData;
    tools: ToolsData;
  },
  newData: {
    profile: ProfileData;
    works: WorksData;
    fun: FunData;
    socials: SocialsData;
    tools: ToolsData;
  },
): Promise<string[]> {
  const oldRefs = collectAssetRefs(oldData);
  const newRefs = collectAssetRefs(newData);
  const removed: string[] = [];
  for (const ref of oldRefs) {
    if (newRefs.has(ref)) continue;
    if (!/^\/(works|fun|social|tools)\//.test(ref)) continue;
    if (ref.includes("..") || !/^\/[\w./-]+$/.test(ref)) continue;
    try {
      await fs.unlink(path.join(PUBLIC_DIR, ref));
      removed.push(ref);
    } catch {
      // 文件本来就不存在等情况，忽略
    }
  }
  return removed;
}

/** 后台上传文件命名：时间戳 + 清洗后的原名，杜绝路径注入 */
export function uploadFileName(originalName: string): { stem: string; ext: string } | null {
  const ext = path.extname(originalName).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"].includes(ext)) return null;
  const stem =
    path
      .basename(originalName, path.extname(originalName))
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "img";
  return { stem, ext };
}

export function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
