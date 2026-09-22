#!/bin/bash
# 双击启动个人官网的本地后台；关闭本窗口即停止后台
cd "$(dirname "$0")" || exit 1

# 已在运行就直接打开页面
if curl -s -o /dev/null --max-time 2 http://localhost:3210/admin; then
  open "http://localhost:3210/admin"
  exit 0
fi

npm run admin &
SERVER_PID=$!

# 等服务就绪（最多 30 秒）后自动打开后台页面
for _ in $(seq 1 30); do
  if curl -s -o /dev/null --max-time 2 http://localhost:3210/admin; then
    open "http://localhost:3210/admin"
    break
  fi
  sleep 1
done

# 前台挂着显示运行日志；点窗口里的 Ctrl+C 或直接关掉窗口 = 停止后台
wait $SERVER_PID
