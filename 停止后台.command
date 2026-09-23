#!/bin/bash
# 双击 = 停止后台服务器（下次想用再双击「启动后台.command」）
launchctl bootout "gui/$(id -u)/com.alin.portfolio-admin" 2>/dev/null
PIDS=$(lsof -ti :3210 2>/dev/null)
[ -n "$PIDS" ] && kill $PIDS 2>/dev/null
sleep 1
if lsof -ti :3210 >/dev/null 2>&1; then
  echo "未能停止，请截图本窗口发给我。"
  exit 1
fi
echo "✓ 后台已停止。网站本身不受影响，一直在线。"
