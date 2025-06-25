# SSL 证书放置说明

## 证书文件放置位置

请将你的 SSL 证书文件放在此目录下，文件命名如下：

- `cert.pem` - SSL 证书文件（或 .crt 文件）
- `key.pem` - SSL 私钥文件（或 .key 文件）

## 支持的文件格式

- `.pem`
- `.crt` / `.cer`
- `.key`

## 注意事项

1. 证书文件不会被提交到 Git 仓库（已在 .gitignore 中配置）
2. 部署前确保证书文件已放置在此目录
3. 证书文件权限应该设置为 600（仅所有者可读写）：
   ```bash
   chmod 600 nginx/ssl/*
   ```

## 部署步骤

1. 将证书文件放入此目录
2. 确认 nginx.conf 中的证书路径正确
3. 使用 `docker-compose -f docker-compose.prod.yml up -d` 部署

## 证书更新

当证书需要更新时：
1. 替换此目录下的证书文件
2. 重启 nginx 容器：`docker-compose -f docker-compose.prod.yml restart nginx`