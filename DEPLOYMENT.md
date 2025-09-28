# 🚀 GitHub Pages 部署指南

## 部署步骤

### 方法一：使用部署脚本（推荐）

#### Windows 用户：
```bash
# 运行批处理文件
deploy-to-github.bat
```

#### Linux/Mac 用户：
```bash
# 给脚本执行权限
chmod +x deploy-to-github.sh

# 运行脚本
./deploy-to-github.sh
```

### 方法二：手动部署

#### 1. 构建前端应用
```bash
npm run frontend:build
```

#### 2. 进入构建目录
```bash
cd frontend/build
```

#### 3. 初始化 Git 仓库
```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

#### 4. 添加并提交文件
```bash
git add .
git commit -m "Deploy FHEVM Privacy Auction to GitHub Pages"
```

#### 5. 推送到 gh-pages 分支
```bash
git branch -M gh-pages
git push -f origin gh-pages
```

## 配置 GitHub Pages

### 1. 在 GitHub 仓库中启用 Pages
1. 进入您的 GitHub 仓库
2. 点击 "Settings" 标签
3. 在左侧菜单中找到 "Pages"
4. 在 "Source" 下选择 "Deploy from a branch"
5. 选择 "gh-pages" 分支和 "/ (root)" 文件夹
6. 点击 "Save"

### 2. 等待部署完成
- GitHub 会自动构建和部署您的应用
- 通常需要几分钟时间
- 部署完成后，您的应用将在以下地址可用：
  `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

## 环境变量配置

### 生产环境配置
在部署前，确保以下配置正确：

1. **合约地址**：检查 `frontend/src/config/contracts.js` 中的合约地址
2. **网络配置**：确保使用正确的网络（Sepolia 测试网）
3. **RPC 配置**：确保 RPC 端点可以公开访问

### 重要提醒
- 确保合约已部署到 Sepolia 测试网
- 合约地址必须是公开可访问的
- 用户需要连接 Sepolia 测试网才能使用应用

## 故障排除

### 常见问题

1. **404 错误**：
   - 检查 GitHub Pages 设置
   - 确保 gh-pages 分支存在
   - 等待几分钟让 GitHub 完成部署

2. **合约连接失败**：
   - 检查合约地址是否正确
   - 确保合约已部署到 Sepolia
   - 检查网络配置

3. **构建失败**：
   - 检查 Node.js 版本
   - 确保所有依赖已安装
   - 检查构建日志

### 更新部署
每次更新代码后，重新运行部署脚本即可更新在线应用。

## 自定义域名（可选）

如果您有自己的域名，可以在 GitHub Pages 设置中配置自定义域名：

1. 在仓库的 Pages 设置中添加自定义域名
2. 在您的域名提供商处配置 CNAME 记录
3. 等待 DNS 传播完成

## 安全注意事项

- 不要将私钥或敏感信息提交到代码仓库
- 使用环境变量管理敏感配置
- 定期更新依赖包
- 监控应用性能和错误日志
