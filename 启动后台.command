#!/bin/bash
# 双击启动个人官网的本地后台；关闭本窗口即停止后台
cd "$(dirname "$0")" || exit 1

# 先清掉可能在占 3210 端口的残留进程（旧服务器卡死/损坏时也能正常启动）
PIDS=$(lsof -ti :3210 2>/dev/null)
if [ -n "$PIDS" ]; then
  echo "检测到残留的后台进程，正在关闭…"
  kill $PIDS 2>/dev/null
  sleep 1
fi

start_server() {
  npm run admin &
  SERVER_PID=$!
  # 等服务就绪（最多 45 秒）
  for _ in $(seq 1 45); do
    if curl -s -o /dev/null --max-time 2 http://localhost:3210/admin; then
      return 0
    fi
    sleep 1
  done
  return 1
}

if ! start_server; then
  # 起不来通常是编译缓存损坏：清掉缓存再试一次
  echo "启动失败，正在清理编译缓存后重试…"
  kill $SERVER_PID 2>/dev/null
  rm -rf .next
  if ! start_server; then
    echo "重试后仍失败，请截图本窗口内容联系我。"
    exit 1
  fi
fi

open "http://localhost:3210/admin"
echo "后台已启动（关闭本窗口即停止）。"
# 前台挂着显示运行日志
wait $SERVER_PID
