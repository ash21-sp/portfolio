import { BackToTopClient } from "@/components/back-to-top";
import { ProtectImages } from "@/components/protect-images";
import { SiteChrome } from "@/components/site-chrome";
import { SiteFooter } from "@/components/site-footer";

/**
 * 左右双栏工作台版式：
 * 桌面端左侧固定身份栏（SiteChrome 内），右侧内容独立滚动；移动端折叠为顶栏 + 身份块。
 * 底层铺固定的点阵纸面 + 蓝晕染场景（.bg-scene），内容浮于其上。
 */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="bg-scene pointer-events-none fixed inset-0 z-0"
      />
      <div className="relative z-10 flex flex-1 flex-col">
        <SiteChrome />
        <main className="flex flex-1 flex-col lg:ml-[320px]">
          <div className="w-full px-6 pb-20 pt-10 lg:px-14 lg:pt-20">
            {children}
          </div>
          <SiteFooter />
        </main>
        <BackToTopClient />
        <ProtectImages />
      </div>
    </div>
  );
}
