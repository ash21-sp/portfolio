"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Star, X } from "lucide-react";
import type { Project, WorksData } from "@/config/site";
import {
  Btn,
  Card,
  Field,
  ImageField,
  MiniBtn,
  TextArea,
  TextInput,
  uploadImage,
} from "./ui";

function emptyProject(categories: string[], year: number): Project {
  return {
    slug: "",
    title: "未命名作品",
    subtitle: "",
    category: categories[1] ?? categories[0] ?? "",
    year: String(year),
    description: [],
  };
}

export function WorksTab({
  works,
  onChange,
}: {
  works: WorksData;
  onChange: (next: WorksData) => void;
}) {
  const { categories, projects } = works;
  const [selected, setSelected] = useState(0);
  const [newCategory, setNewCategory] = useState("");
  const [galleryBusy, setGalleryBusy] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const idx = Math.min(selected, projects.length - 1);
  const project = projects[idx];

  const setProjects = (next: Project[]) => onChange({ ...works, projects: next });
  const patch = (fields: Partial<Project>) => {
    const next = [...projects];
    next[idx] = { ...project, ...fields };
    setProjects(next);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= projects.length) return;
    const next = [...projects];
    [next[i], next[j]] = [next[j], next[i]];
    setProjects(next);
    setSelected(j);
  };

  const remove = (i: number) => {
    const p = projects[i];
    if (
      !window.confirm(
        `确定删除「${p.title}」？\n保存并发布后，它的详情页会下线，上传过的封面和图集图片也会一并清理。`,
      )
    ) {
      return;
    }
    setProjects(projects.filter((_, j) => j !== i));
    setSelected(Math.max(0, i - 1));
  };

  const addGalleryImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setGalleryBusy(true);
    try {
      const added: string[] = [];
      for (const file of Array.from(files)) {
        added.push(await uploadImage(file, "work"));
      }
      patch({ gallery: [...(project.gallery ?? []), ...added] });
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "上传失败");
    } finally {
      setGalleryBusy(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const moveGallery = (i: number, dir: -1 | 1) => {
    const gallery = [...(project.gallery ?? [])];
    const j = i + dir;
    if (j < 0 || j >= gallery.length) return;
    [gallery[i], gallery[j]] = [gallery[j], gallery[i]];
    patch({ gallery });
  };

  const moveCategory = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 1 || j >= categories.length) return; // 「全部」固定在第一位
    const next = [...categories];
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ ...works, categories: next });
  };

  const categoryOptions = categories.slice(1);
  const currentCategory = project.category;
  const options =
    currentCategory && !categoryOptions.includes(currentCategory)
      ? [...categoryOptions, currentCategory]
      : categoryOptions;

  const usedCategories = new Set(projects.map((p) => p.category));

  return (
    <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
      {/* 左栏：作品列表 + 分类 */}
      <div className="space-y-4">
        <Card title={`作品 · ${projects.length}`}>
          <ul className="space-y-1.5">
            {projects.map((p, i) => (
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
                  <span className="block truncate text-sm">
                    {p.featured && (
                      <Star
                        className="mr-1 inline size-3.5 fill-accent text-accent"
                        aria-label="首页精选"
                      />
                    )}
                    {p.title}
                  </span>
                  <span className="block truncate font-mono text-[11px] text-mute">
                    /works/{p.slug || "?"}
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
                <MiniBtn label="删除作品" danger onClick={() => remove(i)}>
                  <X className="size-3" />
                </MiniBtn>
              </li>
            ))}
          </ul>
          <Btn
            variant="primary"
            className="mt-3 w-full"
            onClick={() => {
              setProjects([...projects, emptyProject(categories, new Date().getFullYear())]);
              setSelected(projects.length);
            }}
          >
            <Plus className="size-4" />
            新增作品
          </Btn>
        </Card>

        <Card title="分类">
          <ul className="space-y-1.5">
            {categories.map((c, i) => (
              <li key={i} className="flex items-center gap-1.5">
                {i === 0 ? (
                  <span className="flex-1 rounded-md border border-dashed border-line px-2.5 py-1.5 text-sm text-mute">
                    {c}
                    <span className="ml-1.5 font-mono text-[10px]">全部 · 固定</span>
                  </span>
                ) : (
                  <>
                    <TextInput
                      value={c}
                      aria-label="分类名"
                      onChange={(e) => {
                        const next = [...categories];
                        next[i] = e.target.value.trim();
                        onChange({ ...works, categories: next });
                      }}
                    />
                    <div className="flex flex-col gap-1">
                      <MiniBtn
                        label="上移"
                        onClick={() => moveCategory(i, -1)}
                      >
                        <ArrowUp className="size-3" />
                      </MiniBtn>
                      <MiniBtn
                        label="下移"
                        onClick={() => moveCategory(i, 1)}
                      >
                        <ArrowDown className="size-3" />
                      </MiniBtn>
                    </div>
                    <MiniBtn
                      label="删除分类"
                      danger
                      onClick={() => {
                        const count = [...usedCategories].filter(
                          (used) => used === c,
                        ).length;
                        if (
                          count > 0 &&
                          !window.confirm(
                            `有 ${count} 个作品正在使用「${c}」分类，删除后它们不会再出现在这个分类的筛选里（作品本身不受影响）。确定删除？`,
                          )
                        ) {
                          return;
                        }
                        onChange({
                          ...works,
                          categories: categories.filter((_, j) => j !== i),
                        });
                      }}
                    >
                      <X className="size-3" />
                    </MiniBtn>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex gap-1.5">
            <TextInput
              value={newCategory}
              placeholder="新分类名"
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
            />
            <Btn
              disabled={!newCategory.trim() || categories.includes(newCategory.trim())}
              onClick={() => {
                onChange({ ...works, categories: [...categories, newCategory.trim()] });
                setNewCategory("");
              }}
            >
              <Plus className="size-3.5" />
            </Btn>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            顺序即站点上筛选按钮的排列顺序。
          </p>
        </Card>
      </div>

      {/* 右栏：选中作品的编辑表单 */}
      {project ? (
        <div className="space-y-4">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="标题">
                <TextInput
                  value={project.title}
                  onChange={(e) => patch({ title: e.target.value })}
                />
              </Field>
              <Field
                label="Slug"
                hint={`详情页地址 /works/${project.slug || "…"}；小写字母、数字、短横线，保存后不建议再改`}
              >
                <TextInput
                  value={project.slug}
                  placeholder="如 maxintel"
                  className="font-mono"
                  onChange={(e) => patch({ slug: e.target.value.trim() })}
                />
              </Field>
              <Field label="副标题">
                <TextInput
                  value={project.subtitle}
                  onChange={(e) => patch({ subtitle: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="分类">
                  <select
                    value={currentCategory}
                    onChange={(e) => patch({ category: e.target.value })}
                    className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                  >
                    {!currentCategory && <option value="">（未选择）</option>}
                    {options.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="年份">
                  <TextInput
                    value={project.year}
                    placeholder="2026"
                    onChange={(e) => patch({ year: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="担任角色（可选）">
                <TextInput
                  value={project.role ?? ""}
                  onChange={(e) => patch({ role: e.target.value })}
                />
              </Field>
              <Field label="外链（可选）" hint="填写后作品卡直接跳这个链接，不再进站内详情页">
                <TextInput
                  value={project.link ?? ""}
                  placeholder="https://…"
                  onChange={(e) => patch({ link: e.target.value.trim() })}
                />
              </Field>
              <div className="sm:col-span-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-mute">
                  首页精选
                </span>
                <label className="mt-1.5 flex w-fit cursor-pointer select-none items-center gap-2.5 rounded-md border border-line bg-paper px-3 py-2.5 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-accent"
                    checked={!!project.featured}
                    onChange={(e) => patch({ featured: e.target.checked })}
                  />
                  在首页「精选作品」中展示这件作品
                </label>
                <p className="mt-1 text-xs leading-relaxed text-mute">
                  已选 {projects.filter((p) => p.featured).length} 件 · 建议选 4
                  件（首页按两列排列）；一件都没选时默认展示排序最前的 4 件
                </p>
              </div>
            </div>
          </Card>

          <Card title="图片">
            <div className="grid gap-5 sm:grid-cols-2">
              <ImageField
                label="封面"
                target="work"
                value={project.cover}
                onChange={(cover) => patch({ cover })}
                hint="列表与卡片用；不填则显示排版式封面"
              />
              <Field
                label="详情页图集（可选）"
                hint="按顺序展示在作品详情页；可上传多张、调整顺序"
              >
                <div className="space-y-2">
                  <Btn
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={galleryBusy}
                  >
                    <ImagePlus className="size-3.5" />
                    {galleryBusy ? "上传中…" : "上传图片"}
                  </Btn>
                  {(project.gallery ?? []).length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {(project.gallery ?? []).map((src, i) => (
                        <li
                          key={`${src}-${i}`}
                          className="w-20 overflow-hidden rounded-md border border-line bg-paper"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="h-14 w-full object-cover" />
                          <div className="flex items-center justify-between px-1 py-1">
                            <span className="font-mono text-[10px] text-mute">
                              {i + 1}
                            </span>
                            <span className="flex">
                              <MiniBtn label="前移" onClick={() => moveGallery(i, -1)}>
                                <ArrowUp className="size-3 rotate-[-90deg]" />
                              </MiniBtn>
                              <MiniBtn label="后移" onClick={() => moveGallery(i, 1)}>
                                <ArrowDown className="size-3 rotate-[-90deg]" />
                              </MiniBtn>
                              <MiniBtn
                                label="移除"
                                danger
                                onClick={() =>
                                  patch({
                                    gallery: (project.gallery ?? []).filter(
                                      (_, j) => j !== i,
                                    ),
                                  })
                                }
                              >
                                <X className="size-3" />
                              </MiniBtn>
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => addGalleryImages(e.target.files)}
                  />
                </div>
              </Field>
            </div>
            {project.cover && (
              <label className="mt-4 flex w-fit cursor-pointer select-none items-center gap-2.5 rounded-md border border-line bg-paper px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-accent"
                  checked={project.showCoverInDetail !== false}
                  onChange={(e) =>
                    patch({ showCoverInDetail: e.target.checked })
                  }
                />
                封面同时展示在作品详情页
              </label>
            )}
            {project.cover && (
              <p className="mt-1.5 text-xs leading-relaxed text-mute">
                不勾选时，封面只用于作品列表的卡片，详情页直接从描述和图集开始
              </p>
            )}
          </Card>

          <Card title="详情页描述">
            <Field
              label="描述段落"
              hint="空一行 = 分一段；详情页按段落依次展示"
            >
              <TextArea
                rows={8}
                value={(project.description ?? []).join("\n\n")}
                onChange={(e) =>
                  patch({
                    description: e.target.value
                      .split(/\n{2,}/)
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
          </Card>
        </div>
      ) : (
        <Card>
          <p className="py-12 text-center text-sm text-mute">
            还没有作品，点左侧「新增作品」开始。
          </p>
        </Card>
      )}
    </div>
  );
}
