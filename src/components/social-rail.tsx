import { ArrowUpRight, Dribbble, Github } from "lucide-react";
import { site, type SocialLink } from "@/config/site";

/** 图标瓦片：有 logo 用图片，否则用品牌色字母瓦片 */
function SocialTile({
  social,
  tileClass,
  iconClass,
}: {
  social: SocialLink;
  tileClass: string;
  iconClass: string;
}) {
  if (social.logo) {
    /* eslint-disable-next-line @next/next/no-img-element */
    return (
      <img
        src={social.logo}
        alt=""
        className={`shrink-0 object-cover ${tileClass}`}
      />
    );
  }
  const tile = social.tile;
  if (!tile) return null;
  return (
    <span
      className={`flex shrink-0 items-center justify-center font-bold ${tileClass}`}
      style={{ backgroundColor: tile.bg }}
      aria-hidden
    >
      {tile.icon === "github" ? (
        <Github className={iconClass} style={{ color: tile.fg }} />
      ) : tile.icon === "dribbble" ? (
        <Dribbble className={iconClass} style={{ color: tile.fg }} />
      ) : (
        <span style={{ color: tile.fg }}>{tile.text}</span>
      )}
    </span>
  );
}

/** 桌面端左侧栏：竖排社交链接 */
export function SocialRail() {
  return (
    <ul className="mt-10 space-y-0.5" aria-label="社交链接">
      {site.socials.map((social) => (
        <li key={social.name}>
          <a
            href={social.url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2.5 rounded-md py-1.5 text-[13px] text-mute transition-colors hover:text-ink"
          >
            <SocialTile
              social={social}
              tileClass="size-6 rounded-md text-[10px]"
              iconClass="size-3.5"
            />
            <span className="min-w-0 flex-1 truncate underline-offset-4 group-hover:underline group-hover:decoration-accent">
              {social.name}
              <span className="ml-2 text-[11px] text-mute/70">
                {social.handle}
              </span>
            </span>
            <ArrowUpRight
              className="size-3.5 shrink-0 text-accent opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** 移动端：社交链接横向小胶囊 */
export function SocialChips() {
  return (
    <ul className="flex flex-wrap gap-2 pt-6" aria-label="社交链接">
      {site.socials.map((social) => (
        <li key={social.name}>
          <a
            href={social.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border border-line py-1.5 pl-2 pr-3 text-xs text-mute transition-colors hover:border-mute hover:text-ink"
          >
            <SocialTile
              social={social}
              tileClass="size-5 rounded-full text-[9px]"
              iconClass="size-3"
            />
            {social.name}
          </a>
        </li>
      ))}
    </ul>
  );
}
