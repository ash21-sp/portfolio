/* ================================================================
   作品图水印：上传时把浅色平铺水印烧进图片文件本身，
   这样别人保存到的图片也自带水印（CSS 覆盖层做不到这一点）。
   仅处理 raster 图（png/jpg/webp/avif），SVG 与动图 GIF 跳过，
   小于阈值的图标类图片跳过。顺带剥离 EXIF（相机/GPS 信息）。
   ================================================================ */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { site } from "@/config/site";

const MIN_WIDTH = 420;
const MIN_HEIGHT = 320;
const WATERMARKABLE = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

/** 生成平铺斜排水印 SVG：白色 + 深色两层错位，亮暗底图上都隐约可见 */
function watermarkSvg(w: number, h: number): string {
  const step = Math.max(220, Math.round(Math.min(w, h) / 4));
  const fontSize = Math.max(14, Math.round(step / 13));
  const text = `© ${site.name}`;
  const gap = Math.round(step * 2.4);
  const diag = Math.ceil(Math.hypot(w, h));
  let texts = "";
  for (let y = -diag; y < diag * 2; y += step) {
    for (let x = -diag; x < diag * 2; x += gap) {
      texts += `<text x="${x}" y="${y}">${text}</text>`;
    }
  }
  const common = `font-family="-apple-system, 'Helvetica Neue', 'PingFang SC', sans-serif" font-size="${fontSize}" font-weight="500"`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
    `<g transform="rotate(-30 ${w / 2} ${h / 2})" ${common} fill="rgba(0,0,0,0.05)"><g transform="translate(1.2 1.2)">${texts}</g></g>` +
    `<g transform="rotate(-30 ${w / 2} ${h / 2})" ${common} fill="rgba(255,255,255,0.07)">${texts}</g>` +
    `</svg>`
  );
}

/**
 * 给单张图片烧入水印并原位写回。
 * 返回 true 表示已处理；文件不存在 / 格式不支持 / 图片太小则原样跳过。
 */
export async function watermarkFile(filePath: string): Promise<boolean> {
  const ext = path.extname(filePath).toLowerCase();
  if (!WATERMARKABLE.has(ext)) return false;

  let meta;
  try {
    meta = await sharp(filePath).metadata();
  } catch {
    return false; // 不是有效图片
  }
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (w < MIN_WIDTH || h < MIN_HEIGHT) return false;

  try {
    const buf = await sharp(filePath)
      .composite([{ input: Buffer.from(watermarkSvg(w, h)), blend: "over" }])
      .toBuffer(); // 默认剥离 EXIF / GPS 元数据
    await fs.writeFile(filePath, buf);
    return true;
  } catch {
    return false;
  }
}
