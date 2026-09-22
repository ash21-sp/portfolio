import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { ensureLocalAdmin, timestamp, uploadFileName } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024;

const TARGET_DIRS = {
  work: "works",
  fun: "fun",
  social: "social",
} as const;

type Target = keyof typeof TARGET_DIRS | "avatar";

/**
 * 上传图片（base64）。
 * work/fun/social → public/works|fun|social/<时间戳>-<原名>.<ext>，返回公开路径；
 * avatar          → 固定写入 public/avatar.<ext> 并返回该路径。
 */
export async function POST(req: NextRequest) {
  const denied = ensureLocalAdmin();
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as {
    target?: Target;
    filename?: unknown;
    dataBase64?: unknown;
  } | null;

  const target = body?.target;
  if (
    (target !== "work" && target !== "fun" && target !== "social" && target !== "avatar") ||
    typeof body?.filename !== "string" ||
    typeof body?.dataBase64 !== "string"
  ) {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const named = uploadFileName(body.filename);
  if (!named) {
    return NextResponse.json(
      { error: "只支持 png / jpg / webp / gif / svg / avif 图片" },
      { status: 400 },
    );
  }

  const raw = body.dataBase64;
  const base64 = raw.includes(",") ? raw.slice(raw.indexOf(",") + 1) : raw;
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length === 0) {
    return NextResponse.json({ error: "图片内容为空" }, { status: 400 });
  }
  if (bytes.length > MAX_BYTES) {
    return NextResponse.json({ error: "图片不能超过 10MB" }, { status: 400 });
  }

  try {
    let publicPath: string;
    if (target === "avatar") {
      const name = `avatar${named.ext}`;
      await fs.writeFile(path.join(process.cwd(), "public", name), bytes);
      publicPath = `/${name}`;
    } else {
      const dir = path.join(process.cwd(), "public", TARGET_DIRS[target]);
      await fs.mkdir(dir, { recursive: true });
      const name = `${timestamp()}-${named.stem}${named.ext}`;
      await fs.writeFile(path.join(dir, name), bytes);
      publicPath = `/${TARGET_DIRS[target]}/${name}`;
    }
    return NextResponse.json({ ok: true, path: publicPath });
  } catch (err) {
    return NextResponse.json(
      { error: `保存图片失败：${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  }
}
