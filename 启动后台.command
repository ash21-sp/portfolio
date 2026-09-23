#!/bin/bash
# 双击 = 确保后台在运行并打开管理页面。
# 服务器由 macOS launchd 守护：崩溃自动重启、开机自动启动，本窗口关不关都无所谓。
LABEL="com.alin.portfolio-admin"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
cd "$(dirname "$0")" || exit 1

# 重新装载守护项（改过配置/清过缓存后也能生效）
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null
sleep 1
launchctl bootstrap "gui/$(id -u)" "$PLIST" 2>/dev/null || launchctl load -w "$PLIST" 2>/dev/null

echo "正在启动后台（首次编译约需十几秒）…"
for _ in $(seq 1 60); do
  if curl -s -o /dev/null --max-time 2 http://localhost:3210/admin; then
    open "http://localhost:3210/admin"
    echo "✓ 后台已就绪。它由 macOS 守护，崩溃会自动重启，本窗口可以直接关闭。"
    exit 0
  fi
  sleep 1
done

# 60 秒还没就绪 → 大概率编译缓存损坏：清缓存后由 launchd 自动拉起
echo "启动缓慢，正在清理编译缓存（launchd 会自动重新拉起）…"
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null
rm -rf .next
sleep 2
launchctl bootstrap "gui/$(id -u)" "$PLIST" 2>/dev/null || launchctl load -w "$PLIST" 2>/dev/null
for _ in $(seq 1 90); do
  if curl -s -o /dev/null --max-time 2 http://localhost:3210/admin; then
    open "http://localhost:3210/admin"
    echo "✓ 后台已就绪（已自动清理缓存）。"
    exit 0
  fi
  sleep 1
done

echo "多次尝试后仍未就绪，请把本窗口内容截图发给我。日志：.admin-server.log"
exit 1
