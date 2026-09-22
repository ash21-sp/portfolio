"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import type { FunData, FunProject } from "@/config/site";
import {
  Btn,
  Card,
  Field,
  ImageField,
  MiniBtn,
  TextArea,
  TextInput,
} from "./ui";

function emptyFun(): FunProject {
  return { title: "新玩具", description: "", tags: [] };
}

export function FunTab({
  fun,
  onChange,
}: {
  fun: FunData;
  onChange: (next: FunData) => void;
}) {
  const items = fun.funProjects;
  const [selected, setSelected] = useState(0);

  const idx = Math.min(selected, items.length - 1);
  const item = items[idx];

  const setItems = (next: FunProject[]) =>
    onChange({ funProjects: next });
  const patch = (fields: Partial<FunProject>) => {
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
      <Card title={`条目 · ${items.length}`}>
        <ul className="space-y-1.5">
          {items.map((it, i) => (
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
                <span className="block truncate text-sm">{it.title}</span>
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
                  if (!window.confirm(`确定删除「${it.title}」？`)) return;
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
            setItems([...items, emptyFun()]);
            setSelected(items.length);
          }}
        >
          <Plus className="size-4" />
          新增条目
        </Btn>
      </Card>

      {item ? (
        <Card title="编辑条目">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="标题">
              <TextInput
                value={item.title}
                onChange={(e) => patch({ title: e.target.value })}
              />
            </Field>
            <Field label="标签" hint="用逗号分隔，如：SVG, 随机算法">
              <TextInput
                value={item.tags.join("，")}
                placeholder="SVG，随机算法"
                onChange={(e) =>
                  patch({
                    tags: e.target.value
                      .split(/[，,、]/)
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="一句话描述">
                <TextArea
                  rows={2}
                  value={item.description}
                  onChange={(e) => patch({ description: e.target.value })}
                />
              </Field>
            </div>
            <ImageField
              label="Logo（可选）"
              target="fun"
              value={item.logo}
              onChange={(logo) => patch({ logo })}
              hint="支持 SVG / PNG"
            />
            <Field
              label="在线演示地址（可选）"
              hint="不填则条目不可点击"
            >
              <TextInput
                value={item.url ?? ""}
                placeholder="https://…"
                onChange={(e) => patch({ url: e.target.value.trim() })}
              />
            </Field>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="py-12 text-center text-sm text-mute">
            还没有条目，点左侧「新增条目」开始。
          </p>
        </Card>
      )}
    </div>
  );
}
