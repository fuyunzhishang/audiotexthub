# SSL 证书设置指南

## 1. 创建 SSL 证书目录
```bash
mkdir -p ssl
```

## 2. 获取 SSL 证书

### 选项 A: 使用 Let's Encrypt（免费证书）
```bash
# 安装 certbot
sudo apt-get update
sudo apt-get install certbot

# 获取证书（替换 your-domain.com 为你的域名）
sudo certbot certonly --standalone -d your-domain.com

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
sudo chmod 644 ./ssl/cert.pem
sudo chmod 600 ./ssl/key.pem
```

### 选项 B: 使用自签名证书（仅用于测试）
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./ssl/key.pem \
  -out ./ssl/cert.pem \
  -subj "/C=CN/ST=State/L=City/O=Organization/CN=localhost"
```

### 选项 C: 使用购买的证书
将你的证书文件复制到 ssl 目录：
- 证书文件命名为 `cert.pem`
- 私钥文件命名为 `key.pem`

## 3. 更新配置

1. 编辑 `nginx.conf`，将 `server_name` 替换为你的域名
2. 编辑 `docker-compose.prod.yml`，更新环境变量中的域名

## 4. 启动服务

```bash
# 构建应用镜像
docker build -t audiotexthub:latest .

# 启动服务
docker-compose -f docker-compose.prod.yml up -d
```

## 5. 验证

- 访问 http://your-domain.com（应自动重定向到 HTTPS）
- 访问 https://your-domain.com（应显示你的应用）

## 注意事项

1. 确保防火墙开放 80 和 443 端口
2. 如果使用云服务器，确保安全组规则允许这些端口
3. Let's Encrypt 证书需要每 90 天更新一次，建议设置自动更新