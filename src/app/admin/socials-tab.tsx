"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import type { SocialLink, SocialsData } from "@/config/site";
import {
  Btn,
  Card,
  Field,
  ImageField,
  MiniBtn,
  TextInput,
} from "./ui";

function emptySocial(): SocialLink {
  return { name: "", handle: "", url: "https://" };
}

export function SocialsTab({
  socials,
  onChange,
}: {
  socials: SocialsData;
  onChange: (next: SocialsData) => void;
}) {
  const items = socials.socials;
  const [selected, setSelected] = useState(0);

  const idx = Math.min(selected, items.length - 1);
  const item = items[idx];

  const setItems = (next: SocialLink[]) => onChange({ socials: next });
  const patch = (fields: Partial<SocialLink>) => {
    const next = [...items];
    next[idx] = { ...item, ...fields };
    setItems(next);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    setSelected(j);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
      <Card title={`链接 · ${items.length}`}>
        <ul className="space-y-1.5">
          {items.map((s, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelected(i)}
                className={`min-w-0 flex-1 rounded-md border px-2.5 py-2 text-left transition-colors ${
                  i === idx
                    ? "border-accent bg-accent-soft"
                    : "border-line hover:border-mute"
                }`}
              >
                <span className="block truncate text-sm">{s.name || "（未命名）"}</span>
                <span className="block truncate font-mono text-[11px] text-mute">
                  {s.handle}
                </span>
              </button>
              <div className="flex flex-col gap-1">
                <MiniBtn label="上移" onClick={() => move(i, -1)}>
                  <ArrowUp className="size-3" />
                </MiniBtn>
                <MiniBtn label="下移" onClick={() => move(i, 1)}>
                  <ArrowDown className="size-3" />
                </MiniBtn>
              </div>
              <MiniBtn
                label="删除"
                danger
                onClick={() => {
                  if (!window.confirm(`确定删除「${s.name}」？发布后它将从网站上消失。`)) return;
                  setItems(items.filter((_, j) => j !== i));
                  setSelected(Math.max(0, i - 1));
                }}
              >
                <X className="size-3" />
              </MiniBtn>
            </li>
          ))}
        </ul>
        <Btn
          variant="primary"
          className="mt-3 w-full"
          onClick={() => {
            setItems([...items, emptySocial()]);
            setSelected(items.length);
          }}
        >
          <Plus className="size-4" />
          添加社交链接
        </Btn>
      </Card>

      {item ? (
        <div className="space-y-4">
          <Card title="编辑链接">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="平台名" hint="显示在站点左侧栏，如：小红书">
                <TextInput
                  value={item.name}
                  placeholder="小红书"
                  onChange={(e) => patch({ name: e.target.value })}
                />
              </Field>
              <Field label="账号名" hint="如：@一舟设计日记">
                <TextInput
                  value={item.handle}
                  onChange={(e) => patch({ handle: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field
                  label="跳转链接"
                  hint="点击这个社交入口时打开的网址，如你的小红书主页 https://www.xiaohongshu.com/user/profile/…"
                >
                  <TextInput
                    value={item.url}
                    placeholder="https://…"
                    onChange={(e) => patch({ url: e.target.value.trim() })}
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card title="图标">
            <div className="grid gap-5 sm:grid-cols-2">
              <ImageField
                label="平台图标"
                target="social"
                value={item.logo}
                onChange={(logo) => patch({ logo })}
                hint="SVG / PNG 都行；上传后自动替换站点上的图标"
              />
              <div className="space-y-3">
                <p className="font-mono text-[11px] uppercase tracking-widest text-mute">
                  无图标时的字母瓦片（可选）
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="底色">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        aria-label="瓦片底色"
                        value={/^#[0-9a-fA-F]{6}$/.test(item.tile?.bg ?? "") ? item.tile!.bg : "#181717"}
                        className="size-9 shrink-0 cursor-pointer rounded border border-line bg-surface p-0.5"
                        onChange={(e) =>
                          patch({
                            tile: { bg: e.target.value, fg: item.tile?.fg ?? "#FFFFFF", text: item.tile?.text, icon: item.tile?.icon },
                          })
                        }
                      />
                      <TextInput
                        value={item.tile?.bg ?? ""}
                        placeholder="#181717"
                        className="font-mono"
                        onChange={(e) =>
                          patch({
                            tile: { bg: e.target.value, fg: item.tile?.fg ?? "#FFFFFF", text: item.tile?.text, icon: item.tile?.icon },
                          })
                        }
                      />
                    </div>
                  </Field>
                  <Field label="字色">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        aria-label="瓦片字色"
                        value={/^#[0-9a-fA-F]{6}$/.test(item.tile?.fg ?? "") ? item.tile!.fg : "#FFFFFF"}
                        className="size-9 shrink-0 cursor-pointer rounded border border-line bg-surface p-0.5"
                        onChange={(e) =>
                          patch({
                            tile: { bg: item.tile?.bg ?? "#181717", fg: e.target.value, text: item.tile?.text, icon: item.tile?.icon },
                          })
                        }
                      />
                      <TextInput
                        value={item.tile?.fg ?? ""}
                        placeholder="#FFFFFF"
                        className="font-mono"
                        onChange={(e) =>
                          patch({
                            tile: { bg: item.tile?.bg ?? "#181717", fg: e.target.value, text: item.tile?.text, icon: item.tile?.icon },
                          })
                        }
                      />
                    </div>
                  </Field>
                </div>
                <Field label="瓦片文字" hint="没有图标时显示的一两个字，如：书">
                  <TextInput
                    value={item.tile?.text ?? ""}
                    onChange={(e) =>
                      patch({
                        tile: { bg: item.tile?.bg ?? "#181717", fg: item.tile?.fg ?? "#FFFFFF", text: e.target.value, icon: item.tile?.icon },
                      })
                    }
                  />
                </Field>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <p className="py-12 text-center text-sm text-mute">
            还没有社交链接，点左侧「添加社交链接」开始。
          </p>
        </Card>
      )}
    </div>
  );
}
