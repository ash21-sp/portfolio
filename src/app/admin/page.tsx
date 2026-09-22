"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, Rocket, Save, X } from "lucide-react";
import type { FunData, ProfileData, WorksData } from "@/config/site";
import { Btn } from "./ui";
import { WorksTab } from "./works-tab";
import { ProfileTab } from "./profile-tab";
import { FunTab } from "./fun-tab";

type Data = { profile: ProfileData; works: WorksData; fun: FunData };
type Tab = "works" | "profile" | "fun";
type Section = keyof Data;

type PublishResult = {
  status:
    | "pushed"
    | "clean"
    | "committed-local"
    | "no-git"
    | "no-identity"
    | "push-failed";
  branch?: string;
  commit?: string;
  detail?: string;
};

const TABS: { key: Tab; label: string; section: Section }[] = [
  { key: "works", label: "作品", section: "works" },
  { key: "profile", label: "首页与简介", section: "profile" },
  { key: "fun", label: "好玩的", section: "fun" },
];

export default function AdminPage() {
  const [data, setData] = useState<Data | null>(null);
  const [prod, setProd] = useState(false);
  const [tab, setTab] = useState<Tab>("works");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [publish, setPublish] = useState<PublishResult | "loading" | null>(null);
  const savedRef = useRef<Data | null>(null);

  useEffect(() => {
    fetch("/api/admin/content")
      .then(async (res) => {
        if (!res.ok) {
          setProd(true);
          return;
        }
        const json = (await res.json()) as Data;
        setData(json);
        savedRef.current = JSON.parse(JSON.stringify(json)) as Data;
      })
      .catch(() => setProd(true));
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  const dirtySections = useCallback((current: Data | null): Set<Section> => {
    const dirty = new Set<Section>();
    if (!current || !savedRef.current) return dirty;
    for (const s of ["profile", "works", "fun"] as const) {
      if (JSON.stringify(current[s]) !== JSON.stringify(savedRef.current[s])) {
        dirty.add(s);
      }
    }
    return dirty;
  }, []);

  const dirty = dirtySections(data);

  const save = useCallback(async (): Promise<boolean> => {
    if (!data) return false;
    setSaving(true);
    setErrors([]);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as {
        errors?: string[];
        removedAssets?: string[];
        error?: string;
      };
      if (res.status === 422 && json.errors) {
        setErrors(json.errors);
        return false;
      }
      if (!res.ok) {
        setErrors([json.error ?? "保存失败"]);
        return false;
      }
      savedRef.current = JSON.parse(JSON.stringify(data)) as Data;
      setNotice(
        json.removedAssets && json.removedAssets.length > 0
          ? `已保存，并清理了 ${json.removedAssets.length} 张不再使用的图片`
          : "已保存",
      );
      return true;
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "保存失败"]);
      return false;
    } finally {
      setSaving(false);
    }
  }, [data]);

  const doPublish = useCallback(async () => {
    if (dirtySections(data).size > 0) {
      const ok = await save();
      if (!ok) return;
    }
    setPublish("loading");
    setErrors([]);
    try {
      const res = await fetch("/api/admin/publish", { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as PublishResult;
      setPublish(json);
    } catch (err) {
      setPublish({
        status: "push-failed",
        detail: err instanceof Error ? err.message : "发布请求失败",
      });
    }
  }, [data, dirtySections, save]);

  /* ---- 三种整页状态 ---- */

  if (prod) {
    return (
      <Shell>
        <div className="grid min-h-[60vh] place-items-center">
          <div className="max-w-md rounded-lg border border-line bg-surface p-8 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-mute">
              Admin · local only
            </p>
            <h1 className="mt-3 text-lg font-bold">后台只能在本地使用</h1>
            <p className="mt-3 text-sm leading-relaxed text-mute">
              线上站点不包含后台。回到你的电脑，在项目目录运行{" "}
              <code className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-accent">
                npm run admin
              </code>
              ，再打开这个页面。
            </p>
            <Link
              href="/"
              className="mt-5 inline-block text-sm text-accent underline underline-offset-4"
            >
              ← 返回网站首页
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  if (!data) {
    return (
      <Shell>
        <p className="py-24 text-center font-mono text-sm text-mute">
          载入内容中…
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* 顶栏 */}
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <p className="font-mono text-sm font-bold tracking-tight">
            {data.profile.logo}
            <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-normal uppercase tracking-widest text-accent">
              admin
            </span>
          </p>

          <nav className="flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  tab === t.key
                    ? "bg-accent text-accent-contrast"
                    : "text-mute hover:bg-accent-soft hover:text-ink"
                }`}
              >
                {t.label}
                {dirty.has(t.section) && (
                  <span
                    className="ml-1.5 inline-block size-1.5 rounded-full bg-accent"
                    title="有未保存的修改"
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden font-mono text-[11px] text-mute sm:inline">
              {saving ? "保存中…" : dirty.size > 0 ? "未保存" : "已保存"}
            </span>
            <Btn onClick={save} disabled={saving || dirty.size === 0}>
              <Save className="size-3.5" />
              保存
            </Btn>
            <Btn variant="primary" onClick={doPublish} disabled={saving}>
              <Rocket className="size-3.5" />
              发布上线
            </Btn>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              title="打开网站预览"
              className="grid size-8 place-items-center rounded-md border border-line text-mute transition-colors hover:border-accent hover:text-accent"
            >
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* 正文 */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {notice && (
          <p className="mb-4 rounded-md border border-accent/30 bg-accent-soft px-3.5 py-2 text-sm text-accent">
            {notice}
          </p>
        )}
        {errors.length > 0 && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/5 px-4 py-3">
            <p className="text-sm font-bold text-red-500">
              有 {errors.length} 个问题需要先解决：
            </p>
            <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-red-500/90">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {tab === "works" && (
          <WorksTab works={data.works} onChange={(works) => setData({ ...data, works })} />
        )}
        {tab === "profile" && (
          <ProfileTab
            profile={data.profile}
            onChange={(profile) => setData({ ...data, profile })}
          />
        )}
        {tab === "fun" && (
          <FunTab fun={data.fun} onChange={(fun) => setData({ ...data, fun })} />
        )}

        <p className="mt-10 text-center font-mono text-[11px] text-mute">
          后台只在本机运行，线上站点没有 /admin 页面 · 改动先「保存」到本地文件，再「发布上线」推送到 GitHub
        </p>
      </main>

      {/* 发布结果浮层 */}
      {publish && (
        <div className="fixed bottom-6 right-6 z-30 w-[400px] max-w-[calc(100vw-3rem)] rounded-lg border border-line bg-surface p-5 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-widest text-mute">
              发布
            </p>
            <button
              type="button"
              onClick={() => setPublish(null)}
              className="text-mute transition-colors hover:text-ink"
              aria-label="关闭"
            >
              <X className="size-4" />
            </button>
          </div>
          {publish === "loading" ? (
            <p className="mt-3 font-mono text-sm text-mute">正在提交推送…</p>
          ) : (
            <div className="mt-3">
              <p
                className={`text-sm font-bold ${
                  publish.status === "pushed"
                    ? "text-accent"
                    : publish.status === "clean"
                      ? "text-mute"
                      : "text-red-500"
                }`}
              >
                {publish.status === "pushed" && "✓ 已推送到 GitHub"}
                {publish.status === "clean" && "没有需要发布的内容"}
                {publish.status === "committed-local" && "已提交到本地，等待配置远程仓库"}
                {publish.status === "no-git" && "还不是 git 仓库"}
                {publish.status === "no-identity" && "git 缺少署名配置"}
                {publish.status === "push-failed" && "推送失败"}
              </p>
              {publish.branch && (
                <p className="mt-1 font-mono text-[11px] text-mute">
                  branch: {publish.branch}
                  {publish.commit && ` · commit: ${publish.commit}`}
                </p>
              )}
              {publish.detail && (
                <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-mute">
                  {publish.detail}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-paper text-ink">{children}</div>;
}
