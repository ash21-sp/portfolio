import { site } from "@/config/site";

/** 工具墙：真实应用图标，常亮彩色 */
export function ToolsWall() {
  return (
    <div className="pt-5">
      <ul className="flex flex-wrap gap-3">
        {site.tools.map((tool) => (
          <li key={tool.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tool.img}
              alt={tool.name}
              title={tool.name}
              width={44}
              height={44}
              className="size-11 cursor-default rounded-xl object-cover"
            />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-mute">
        {site.tools.map((t) => t.name).join(" · ")}
      </p>
    </div>
  );
}
