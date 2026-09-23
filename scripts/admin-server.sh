#!/bin/bash
# 后台服务的真正入口，由 macOS launchd 守护管理（见 启动后台.command）
# 职责：清掉占用 3210 端口的残留进程，然后以前台方式运行 dev 服务器

# nvm 安装的 node 不在 launchd 的默认 PATH 里，补上
export PATH="/Users/parkjay/.nvm/versions/node/v24.20.0/bin:$PATH"
# 经无中文的符号链接进入项目（launchd 对中文路径 spawn 不稳定）
cd /Users/parkjay/portfolio-admin || exit 1

PIDS=$(lsof -ti :3210 2>/dev/null)
if [ -n "$PIDS" ]; then
  kill $PIDS 2>/dev/null
  sleep 1
fi

exec npm run admin
