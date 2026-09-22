"use client";

import { useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Upload, X } from "lucide-react";
import type { BioSegment } from "@/config/site";

/* ---------------- 基础样式 ---------------- */

export const inputCls =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink " +
  "placeholder:text-mute/50 transition-colors focus:border-accent focus:outline-none";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-widest text-mute">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs leading-relaxed text-mute">{hint}</p>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${inputCls} resize-y leading-relaxed ${props.className ?? ""}`}
    />
  );
}

export function Btn({
  variant = "ghost",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const styles = {
    primary:
      "bg-accent text-accent-contrast border-accent hover:opacity-90",
    ghost:
      "border-line text-ink hover:border-accent hover:text-accent",
    danger:
      "border-line text-mute hover:border-red-500 hover:text-red-500",
  }[variant];
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    />
  );
}

/** 列表行里的小方块按钮（上移/下移/删除） */
export function MiniBtn({
  label,
  onClick,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`grid size-7 shrink-0 place-items-center rounded border border-line text-mute transition-colors ${
        danger
          ? "hover:border-red-400 hover:text-red-500"
          : "hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}

export function Card({
  title,
  children,
  actions,
}: {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      {(title || actions) && (
        <header className="mb-4 flex items-center justify-between">
          {title && (
            <h3 className="font-mono text-xs uppercase tracking-widest text-mute">
              {title}
            </h3>
          )}
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

/* ---------------- 图片上传 ---------------- */

export async function uploadImage(
  file: File,
  target: "work" | "fun" | "avatar",
): Promise<string> {
  if (file.size > 10 * 1024 * 1024) throw new Error("图片不能超过 10MB");
  const dataBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target, filename: file.name, dataBase64 }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    path?: string;
    error?: string;
  };
  if (!res.ok || !json.path) throw new Error(json.error ?? "上传失败");
  return json.path;
}

/** 单图字段：预览 + 上传 + 移除（只改数据，文件清理发生在保存时） */
export function ImageField({
  label,
  value,
  target,
  onChange,
  hint,
  removable = true,
}: {
  label: string;
  value?: string;
  target: "work" | "fun" | "avatar";
  onChange: (path: string | undefined) => void;
  hint?: string;
  removable?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadImage(file, target));
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Field label={label} hint={hint}>
      <div className="flex items-start gap-3">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-paper">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <span className="font-mono text-[10px] text-mute">无图</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap gap-2">
            <Btn onClick={() => inputRef.current?.click()} disabled={busy}>
              <Upload className="size-3.5" />
              {busy ? "上传中…" : value ? "更换图片" : "上传图片"}
            </Btn>
            {value && removable && (
              <Btn variant="danger" onClick={() => onChange(undefined)}>
                <X className="size-3.5" />
                移除
              </Btn>
            )}
          </div>
          <p className="truncate font-mono text-[11px] text-mute">
            {value || "（留空则使用排版式占位）"}
          </p>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
    </Field>
  );
}

/* ---------------- 文本列表（轮换标语等） ---------------- */

export function StringList({
  label,
  items,
  onChange,
  addLabel,
  hint,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  hint?: string;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <Field label={label} hint={hint}>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <TextInput
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
            />
            <MiniBtn label="上移" onClick={() => move(i, -1)}>
              <ArrowUp className="size-3.5" />
            </MiniBtn>
            <MiniBtn label="下移" onClick={() => move(i, 1)}>
              <ArrowDown className="size-3.5" />
            </MiniBtn>
            <MiniBtn
              label="删除"
              danger
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              <X className="size-3.5" />
            </MiniBtn>
          </li>
        ))}
      </ul>
      <Btn
        className="mt-2"
        onClick={() => onChange([...items, ""])}
        disabled={items.some((t) => !t.trim())}
      >
        <Plus className="size-3.5" />
        {addLabel}
      </Btn>
    </Field>
  );
}

/* ---------------- 简介（bio）编辑器 ---------------- */

/** 把一行文本解析成片段：[文字](链接) → 链接片段，其余为纯文本 */
export function parseBioLine(line: string): BioSegment[] {
  const segs: BioSegment[] = [];
  const re = /\[([^\[\]]+)\]\(([^()]*)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) segs.push({ text: line.slice(last, m.index) });
    const href = m[2].trim();
    if (href) segs.push({ text: m[1], href });
    else segs.push({ text: m[1] });
    last = m.index + m[0].length;
  }
  if (last < line.length) segs.push({ text: line.slice(last) });
  return segs.length > 0 ? segs : [{ text: "" }];
}

export function bioLineToString(para: BioSegment[]): string {
  return para
    .map((s) => (s.href ? `[${s.text}](${s.href})` : s.text))
    .join("");
}

function BioPreview({ para }: { para: BioSegment[] }) {
  return (
    <p className="mt-1.5 rounded border border-dashed border-line bg-paper px-2.5 py-1.5 text-xs leading-relaxed text-mute">
      预览：
      {para.map((seg, i) =>
        seg.href ? (
          <a
            key={i}
            href={seg.href}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.preventDefault()}
            className="text-accent underline decoration-accent/40 underline-offset-2"
          >
            {seg.text}
          </a>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </p>
  );
}

export function BioEditor({
  value,
  onChange,
}: {
  value: BioSegment[][];
  onChange: (next: BioSegment[][]) => void;
}) {
  const lines = value.map(bioLineToString);
  const update = (i: number, line: string) => {
    const next = [...value];
    next[i] = parseBioLine(line);
    onChange(next);
  };
  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <Field
      label="关于 · 自我介绍"
      hint="每段一个输入框；写成 [文字](https://…) 会渲染为蓝色链接（和站点上一致）。"
    >
      <div className="space-y-3">
        {lines.map((line, i) => (
          <div key={i} className="rounded-md border border-line bg-paper p-2.5">
            <div className="flex items-start gap-2">
              <TextArea
                rows={2}
                value={line}
                onChange={(e) => update(i, e.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <MiniBtn label="上移" onClick={() => move(i, -1)}>
                  <ArrowUp className="size-3.5" />
                </MiniBtn>
                <MiniBtn label="下移" onClick={() => move(i, 1)}>
                  <ArrowDown className="size-3.5" />
                </MiniBtn>
                <MiniBtn
                  label="删除这一段"
                  danger
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                >
                  <X className="size-3.5" />
                </MiniBtn>
              </div>
            </div>
            <BioPreview para={value[i]} />
          </div>
        ))}
      </div>
      <Btn className="mt-2" onClick={() => onChange([...value, [{ text: "" }]])}>
        <Plus className="size-3.5" />
        添加一段
      </Btn>
    </Field>
  );
}
