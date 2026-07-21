#!/bin/bash
# 启动飞书桥。Ctrl-C 停止。日志同时写到 bridge.log。
cd "$(dirname "$0")"
export PYTHONUNBUFFERED=1
exec python3 bridge.py 2>&1 | tee -a bridge.log
