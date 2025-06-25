#!/bin/bash

# 创建自签名证书用于测试
# 注意：这只能用于测试，生产环境请使用正式证书

mkdir -p nginx/ssl

# 生成私钥和自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/key.pem \
    -out nginx/ssl/cert.pem \
    -subj "/C=CN/ST=State/L=City/O=Organization/CN=www.audiotexthub.pro"

echo "自签名证书已生成："
echo "- nginx/ssl/cert.pem (证书)"
echo "- nginx/ssl/key.pem (私钥)"
echo ""
echo "注意：这是自签名证书，浏览器会显示安全警告。"
echo "生产环境请使用正式的SSL证书。"