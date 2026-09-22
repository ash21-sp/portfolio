import { NextResponse, type NextRequest } from "next/server";
import type { FunData, ProfileData, WorksData } from "@/config/site";
import {
  cleanupOrphanAssets,
  ensureLocalAdmin,
  readSection,
  validateFun,
  validateProfile,
  validateWorks,
  writeSection,
} from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AllContent = { profile: ProfileData; works: WorksData; fun: FunData };

/** 读取全部后台内容 */
export async function GET() {
  const denied = ensureLocalAdmin();
  if (denied) return denied;
  try {
    const [profile, works, fun] = await Promise.all([
      readSection<ProfileData>("profile"),
      readSection<WorksData>("works"),
      readSection<FunData>("fun"),
    ]);
    return NextResponse.json({ profile, works, fun });
  } catch (err) {
    return NextResponse.json(
      { error: `读取内容失败：${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  }
}

/** 保存全部后台内容；保存前整体校验，保存后清理不再被引用的上传图片 */
export async function PUT(req: NextRequest) {
  const denied = ensureLocalAdmin();
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as AllContent | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const errors = [
    ...validateProfile(body.profile),
    ...validateWorks(body.works),
    ...validateFun(body.fun),
  ];
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  try {
    const oldData: AllContent = {
      profile: await readSection("profile"),
      works: await readSection("works"),
      fun: await readSection("fun"),
    };
    await writeSection("profile", body.profile);
    await writeSection("works", body.works);
    await writeSection("fun", body.fun);
    const removedAssets = await cleanupOrphanAssets(oldData, body);
    return NextResponse.json({ ok: true, removedAssets });
  } catch (err) {
    return NextResponse.json(
      { error: `保存失败：${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  }
}
