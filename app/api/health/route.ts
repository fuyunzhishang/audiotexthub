import { NextResponse } from 'next/server';

export async function GET() {
  // 获取内存使用情况
  const memoryUsage = process.memoryUsage();
  
  // 转换为 MB
  const memoryInfo = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024),
  };

  // 如果堆内存使用超过 800MB，返回警告
  if (memoryInfo.heapUsed > 800) {
    console.warn('High memory usage detected:', memoryInfo);
  }

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    memory: {
      ...memoryInfo,
      unit: 'MB'
    },
    env: process.env.NODE_ENV,
  });
}