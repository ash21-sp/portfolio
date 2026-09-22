import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse, type NextRequest } from "next/server";
import { ensureLocalAdmin, timestamp } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const run = promisify(execFile);

function git(args: string[], cwd: string) {
  // 终端提示关掉：没有缓存凭据时让推送快速失败并给出指引，而不是挂住
  return run("git", args, {
    cwd,
    timeout: 120_000,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
}

function errText(err: unknown): string {
  const e = err as { stderr?: string; message?: string };
  return (e.stderr || e.message || String(err)).trim();
}

type PublishResult = {
  status:
    | "pushed" // 有新提交并已推送
    | "clean" // 没有任何待发布内容
    | "committed-local" // 已本地提交，但尚未配置远程仓库
    | "no-git" // 还不是 git 仓库
    | "no-identity" // git 没配 user.name / user.email
    | "push-failed"; // 推送被拒（凭据、网络等）
  branch?: string;
  commit?: string;
  detail?: string;
};

/** 一键发布：git add(仅 content/public) → commit → push */
export async function POST(_req: NextRequest) {
  const denied = ensureLocalAdmin();
  if (denied) return denied;

  const cwd = process.cwd();

  try {
    await git(["rev-parse", "--is-inside-work-tree"], cwd);
  } catch {
    return NextResponse.json({
      status: "no-git",
      detail: "这个项目还没有初始化 git 仓库，先看 README 的「首次部署」完成配置。",
    } satisfies PublishResult);
  }

  try {
    await git(["add", "content", "public"], cwd);

    const { stdout: staged } = await git(
      ["status", "--porcelain", "--", "content", "public"],
      cwd,
    );

    let commit: string | undefined;
    if (staged.trim()) {
      const message = `站点内容更新 ${timestamp()}`;
      try {
        await git(["commit", "-m", message], cwd);
      } catch (err) {
        const text = errText(err);
        if (/user\.name|user\.email|tell me who you are/i.test(text)) {
          return NextResponse.json({
            status: "no-identity",
            detail:
              "git 还没有配置署名。在终端执行：\n" +
              '  git config --global user.name "你的名字"\n' +
              '  git config --global user.email "你的邮箱"\n' +
              "然后重新发布。",
          } satisfies PublishResult);
        }
        throw err;
      }
    }

    const { stdout: branchOut } = await git(
      ["rev-parse", "--abbrev-ref", "HEAD"],
      cwd,
    );
    const branch = branchOut.trim() || "main";

    // 有没有领先上游的本地提交（没有上游视为 -1）
    let ahead = 0;
    try {
      const { stdout } = await git(
        ["rev-list", "--count", "@{u}..HEAD"],
        cwd,
      );
      ahead = Number.parseInt(stdout.trim(), 10) || 0;
    } catch {
      ahead = -1;
    }

    if (!staged.trim() && ahead === 0) {
      return NextResponse.json({
        status: "clean",
        branch,
        detail: "内容和线上一致，没有需要发布的东西。",
      } satisfies PublishResult);
    }

    try {
      await git(
        ahead === -1 ? ["push", "-u", "origin", branch] : ["push"],
        cwd,
      );
    } catch (err) {
      const text = errText(err);
      if (
        /no configured push destination|does not appear to be a git repository|could not read from remote repository/i.test(
          text,
        )
      ) {
        // 本地提交不会丢，等远程配好后再点一次发布即可
        const { stdout: hash } = await git(["rev-parse", "--short", "HEAD"], cwd);
        return NextResponse.json({
          status: "committed-local",
          branch,
          commit: hash.trim(),
          detail:
            "内容已提交到本地，但还没有配置 GitHub 远程仓库，推送没有执行。\n" +
            "按 README 的「首次部署」建好仓库并 git remote add origin … 后，再点一次「发布」。",
        } satisfies PublishResult);
      }
      return NextResponse.json({
        status: "push-failed",
        branch,
        detail: `推送失败，内容已提交到本地，不会丢失。常见原因：GitHub 凭据过期或没网。\n\n${text.slice(-600)}`,
      } satisfies PublishResult);
    }

    const { stdout: hash } = await git(["rev-parse", "--short", "HEAD"], cwd);
    return NextResponse.json({
      status: "pushed",
      branch,
      commit: hash.trim(),
      detail: "已推送到 GitHub，Vercel 正在自动构建，约 1–2 分钟后线上更新。",
    } satisfies PublishResult);
  } catch (err) {
    return NextResponse.json(
      {
        status: "push-failed",
        detail: `发布过程出错：${errText(err).slice(-600)}`,
      } satisfies PublishResult,
      { status: 500 },
    );
  }
}
