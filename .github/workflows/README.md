# GitHub Actions 部署配置说明

## 配置 GitHub Secrets

在使用 GitHub Actions 自动部署之前，需要在 GitHub 仓库中配置以下 Secrets：

### 必需的 Secrets

1. **DEPLOY_HOST**
   - 说明：服务器的IP地址或域名
   - 示例：`192.168.1.100` 或 `your-server.com`

2. **DEPLOY_USER**
   - 说明：SSH登录用户名
   - 示例：`root` 或 `ubuntu`

3. **DEPLOY_PASS**
   - 说明：SSH登录密码
   - 注意：建议使用SSH密钥而不是密码

### 可选的 Secrets

4. **DEPLOY_PORT**
   - 说明：SSH端口号
   - 默认值：22
   - 示例：`2222`

## 配置步骤

1. 进入 GitHub 仓库页面
2. 点击 `Settings` → `Secrets and variables` → `Actions`
3. 点击 `New repository secret`
4. 添加上述必需的 Secrets

## 服务器准备

在部署之前，确保服务器满足以下条件：

1. **安装 Docker**
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```

2. **创建应用目录**
   ```bash
   mkdir -p /var/www/audiotexthub
   ```

3. **配置环境变量**
   - 部署后编辑 `/var/www/audiotexthub/.env`
   - 设置 `NEXT_PUBLIC_API_URL` 为语音识别API地址
   - 设置 `AUTH_SECRET` 为安全密钥

## 手动触发部署

1. 进入 `Actions` 标签页
2. 选择 `Docker Deploy to Production`
3. 点击 `Run workflow`
4. 选择分支并运行

## 查看部署日志

部署后可以通过以下命令查看日志：

```bash
# 查看容器状态
docker ps | grep audiotexthub

# 查看容器日志
docker logs audiotexthub_app_1

# 进入应用目录
cd /var/www/audiotexthub

# 查看环境配置
cat .env
```

## 故障排除

1. **容器无法启动**
   - 检查 `.env` 文件配置
   - 查看 Docker 日志

2. **健康检查失败**
   - 确保3000端口未被占用
   - 检查防火墙设置

3. **SSH连接失败**
   - 验证服务器地址和端口
   - 检查用户名和密码是否正确