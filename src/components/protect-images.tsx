"use client";

import { useEffect } from "react";

/**
 * 防盗最低成本防线：禁止对图片右键另存、拖拽。
 * 注意这只是拦截普通访客的顺手操作，无法防截图与开发者工具，
 * 真正的保护是上传时烧入图片文件的水印（见 src/lib/watermark.ts）。
 */
export function ProtectImages() {
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === "IMG") e.preventDefault();
    };
    document.addEventListener("contextmenu", onContextMenu);
    return () => document.removeEventListener("contextmenu", onContextMenu);
  }, []);

  return null;
}
