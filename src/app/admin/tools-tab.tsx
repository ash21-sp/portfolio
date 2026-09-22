"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import type { Tool, ToolsData } from "@/config/site";
import { Btn, Card, Field, ImageField, MiniBtn, TextInput } from "./ui";

function emptyTool(): Tool {
  return { name: "", img: "" };
}

export function ToolsTab({
  tools,
  onChange,
}: {
  tools: ToolsData;
  onChange: (next: ToolsData) => void;
}) {
  const items = tools.tools;
  const [selected, setSelected] = useState(0);

  const idx = Math.min(selected, items.length - 1);
  const item = items[idx];

  const setItems = (next: Tool[]) => onChange({ tools: next });
  const patch = (fields: Partial<Tool>) => {
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
      <Card title={`工具 · ${items.length}`}>
        <ul className="space-y-1.5">
          {items.map((t, i) => (
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
                <span className="flex items-center gap-2">
                  {t.img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.img} alt="" className="size-5 rounded object-cover" />
                  )}
                  <span className="truncate text-sm">{t.name || "（未命名）"}</span>
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
                  if (!window.confirm(`确定删除「${t.name}」？发布后它将从工具墙上消失。`)) return;
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
            setItems([...items, emptyTool()]);
            setSelected(items.length);
          }}
        >
          <Plus className="size-4" />
          添加工具
        </Btn>
      </Card>

      {item ? (
        <Card title="编辑工具">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="工具名" hint="首页工具墙上显示的名字，如：Figma">
              <TextInput
                value={item.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
            </Field>
            <ImageField
              label="工具图标"
              target="tool"
              value={item.img || undefined}
              onChange={(img) => patch({ img: img ?? item.img })}
              removable={false}
              hint="建议正方形 PNG/SVG；更换后旧图标自动清理"
            />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-mute">
            顺序即首页工具墙从左到右的展示顺序。
          </p>
        </Card>
      ) : (
        <Card>
          <p className="py-12 text-center text-sm text-mute">
            还没有工具，点左侧「添加工具」开始。
          </p>
        </Card>
      )}
    </div>
  );
}
