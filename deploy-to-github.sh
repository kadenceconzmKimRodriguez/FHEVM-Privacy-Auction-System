#!/bin/bash

# GitHub Pages 部署脚本
# 使用方法: ./deploy-to-github.sh

echo "🚀 开始部署到 GitHub Pages..."

# 1. 构建前端应用
echo "📦 构建前端应用..."
npm run frontend:build

# 2. 进入构建目录
cd frontend/build

# 3. 初始化 git 仓库（如果不存在）
if [ ! -d ".git" ]; then
    echo "🔧 初始化 git 仓库..."
    git init
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
fi

# 4. 添加所有文件
echo "📝 添加文件到 git..."
git add .

# 5. 提交更改
echo "💾 提交更改..."
git commit -m "Deploy FHEVM Privacy Auction to GitHub Pages"

# 6. 推送到 gh-pages 分支
echo "🚀 推送到 GitHub Pages..."
git branch -M gh-pages
git push -f origin gh-pages

echo "✅ 部署完成！"
echo "🌐 您的应用将在以下地址可用："
echo "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME"
