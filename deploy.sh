#!/bin/bash

# 部署脚本 - 确保端口映射正确

echo "🚀 开始部署 AudioTextHub..."

# 停止并删除旧容器
echo "📦 停止旧容器..."
docker stop audiotexthub 2>/dev/null || true
docker rm audiotexthub 2>/dev/null || true

# 构建新镜像
echo "🔨 构建 Docker 镜像..."
docker build -t audiotexthub:latest .

# 运行新容器，映射端口
echo "🏃 启动新容器..."
docker run -d \
  --name audiotexthub \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3099}" \
  --restart unless-stopped \
  audiotexthub:latest

# 检查容器状态
echo "✅ 检查容器状态..."
docker ps | grep audiotexthub

echo "🎉 部署完成！应用运行在 http://localhost:3000"