import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { ensureLocalAdmin, readSection } from "@/lib/admin";
import { watermarkFile } from "@/lib/watermark";
import type { WorksData } from "@/config/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 给全部作品图（封面 + 图集）补烧水印，用于存量图片。
 * 重复点击会叠加水印深度，前端需二次确认。
 */
export async function POST() {
  const denied = ensureLocalAdmin();
  if (denied) return denied;

  try {
    const works = await readSection<WorksData>("works");
    const files = new Set<string>();
    for (const p of works.projects ?? []) {
      if (p.cover?.startsWith("/")) files.add(p.cover);
      for (const g of p.gallery ?? []) {
        if (g.startsWith("/")) files.add(g);
      }
    }

    let processed = 0;
    let skipped = 0;
    for (const ref of files) {
      if (ref.includes("..") || !/^\/[\w./-]+$/.test(ref)) continue;
      const ok = await watermarkFile(path.join(process.cwd(), "public", ref));
      if (ok) processed++;
      else skipped++;
    }
    return NextResponse.json({ ok: true, processed, skipped, total: files.size });
  } catch (err) {
    return NextResponse.json(
      { error: `补加水印失败：${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  }
}
