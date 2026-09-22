"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { site } from "@/config/site";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";

/** 作品网格：分类筛选 pills + 项目卡 */
export function ProjectGrid() {
  const [category, setCategory] = useState<string>(site.projectCategories[0]);
  const [minH, setMinH] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  // 锁住网格出现过的最大高度：切换分类时列表长度骤减会让页面变矮，
  // 浏览器随之钳制滚动位置，看起来就是整页弹跳
  const lockHeight = () => {
    const el = wrapRef.current;
    if (!el) return;
    setMinH((prev) => (el.offsetHeight > prev ? el.offsetHeight : prev));
  };

  const changeCategory = (c: string) => {
    lockHeight(); // 与 setCategory 同批提交：高度锁定和列表切换一次生效
    setCategory(c);
  };

  const filtered =
    category === site.projectCategories[0]
      ? site.projects
      : site.projects.filter((p) => p.category === category);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="按分类筛选">
        {site.projectCategories.map((c) => {
          const active = c === category;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={active}
              onClick={() => changeCategory(c)}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                active
                  ? "border-accent bg-accent text-accent-contrast"
                  : "border-line text-mute hover:border-mute hover:text-ink dark:border-white/20"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div ref={wrapRef} style={minH ? { minHeight: `${minH}px` } : undefined}>
        <ul
          key={category}
          className="grid-in mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2"
        >
          {filtered.map((project, i) => {
            const inner = <ProjectCard project={project} index={i} />;

            return (
            <li key={project.title}>
              <Reveal>
                {project.link ? (
                  <a
                    href={project.link}
                    target={
                      project.link.startsWith("http") ? "_blank" : undefined
                    }
                    rel="noreferrer"
                    className="group block"
                  >
                    {inner}
                  </a>
                ) : (
                  <Link
                    href={`/works/${project.slug}`}
                    className="group block"
                  >
                    {inner}
                  </Link>
                )}
              </Reveal>
            </li>
            );
          })}
        </ul>

        {filtered.length === 0 && (
          <p className="mt-10 text-center text-sm text-mute">
            这个分类下还没有作品，先看看其他的吧。
          </p>
        )}
      </div>
    </div>
  );
}
