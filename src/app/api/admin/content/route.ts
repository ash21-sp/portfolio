import { NextResponse, type NextRequest } from "next/server";
import type {
  FunData,
  ProfileData,
  SocialsData,
  ToolsData,
  WorksData,
} from "@/config/site";
import {
  cleanupOrphanAssets,
  ensureLocalAdmin,
  readSection,
  validateFun,
  validateProfile,
  validateSocials,
  validateTools,
  validateWorks,
  writeSection,
} from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AllContent = {
  profile: ProfileData;
  works: WorksData;
  fun: FunData;
  socials: SocialsData;
  tools: ToolsData;
};

/** 读取全部后台内容 */
export async function GET() {
  const denied = ensureLocalAdmin();
  if (denied) return denied;
  try {
    const [profile, works, fun, socials, tools] = await Promise.all([
      readSection<ProfileData>("profile"),
      readSection<WorksData>("works"),
      readSection<FunData>("fun"),
      readSection<SocialsData>("socials"),
      readSection<ToolsData>("tools"),
    ]);
    return NextResponse.json({ profile, works, fun, socials, tools });
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

  const body = (await req.json().catch(() => null)) as Partial<AllContent> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  try {
    // 先读磁盘上的当前值：请求里缺哪个板块就沿用哪个，
    // 这样旧标签页（没有新板块字段）的保存不会崩、也不会误清别的内容
    const current: AllContent = {
      profile: await readSection("profile"),
      works: await readSection("works"),
      fun: await readSection("fun"),
      socials: await readSection("socials"),
      tools: await readSection("tools"),
    };
    const next: AllContent = {
      profile: body.profile ?? current.profile,
      works: body.works ?? current.works,
      fun: body.fun ?? current.fun,
      socials: body.socials ?? current.socials,
      tools: body.tools ?? current.tools,
    };

    const errors = [
      ...validateProfile(next.profile),
      ...validateWorks(next.works),
      ...validateFun(next.fun),
      ...validateSocials(next.socials),
      ...validateTools(next.tools),
    ];
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 422 });
    }

    await writeSection("profile", next.profile);
    await writeSection("works", next.works);
    await writeSection("fun", next.fun);
    await writeSection("socials", next.socials);
    await writeSection("tools", next.tools);
    const removedAssets = await cleanupOrphanAssets(current, next);
    return NextResponse.json({ ok: true, removedAssets });
  } catch (err) {
    return NextResponse.json(
      { error: `保存失败：${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    );
  }
}
