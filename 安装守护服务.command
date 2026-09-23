#!/bin/bash
# 双击 = （重新）安装"后台服务器"为 macOS 系统守护服务。
# 装好后服务器由系统管理：开机自启、崩溃秒级自动重启，日常无需再手动启动。
# 仅在首次使用或换电脑后需要运行一次。

LABEL="com.alin.portfolio-admin"
SRC="$(cd "$(dirname "$0")" && pwd)"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

# node 路径写入服务脚本（nvm 用户每次升级 node 后需重跑本安装器）
NODE_BIN=$(command -v node || echo "/Users/parkjay/.nvm/versions/node/v24.20.0/bin/node")
sed "s|/Users/parkjay/.nvm/versions/node/v24.20.0/bin|$(dirname "$NODE_BIN")|" \
  "$SRC/admin-server-home.sh" > "$HOME/.portfolio-admin-server.sh"
chmod +x "$HOME/.portfolio-admin-server.sh"

sed "s|/Users/parkjay/.portfolio-admin-server.sh|$HOME/.portfolio-admin-server.sh|" \
  "$SRC/com.alin.portfolio-admin.plist" > "$PLIST"

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null
sleep 1
launchctl bootstrap "gui/$(id -u)" "$PLIST" && echo "✓ 守护服务已安装并启动" || {
  echo "安装失败，请截图本窗口发给我。"; exit 1;
}

echo "等待后台就绪…"
for _ in $(seq 1 60); do
  if curl -s -o /dev/null --max-time 2 http://localhost:3210/admin; then
    echo "✓ 完成！以后开机自动运行，崩溃自动重启。管理页面：http://localhost:3210/admin"
    exit 0
  fi
  sleep 1
done
echo "服务已安装但还在编译启动中，稍后直接打开 http://localhost:3210/admin 即可。"
