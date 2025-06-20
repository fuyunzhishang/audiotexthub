'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Play, 
  Download, 
  Trash2, 
  Search,
  Filter,
  Calendar,
  Clock,
  Video
} from 'lucide-react';
import type { DigitalHumanVideo } from '@/types/digital-human';

// 模拟历史数据
const mockHistory: DigitalHumanVideo[] = [
  {
    id: '1',
    text: '欢迎来到我们的数字人平台，这里可以帮助您快速生成专业的视频内容...',
    avatarId: 'professional-female-1',
    avatarName: '专业主持人小美',
    duration: 120,
    status: 'completed',
    createdAt: new Date('2024-01-15T10:30:00'),
    videoUrl: '#'
  },
  {
    id: '2',
    text: '今天我们来学习如何使用Python进行数据分析，首先需要安装必要的库...',
    avatarId: 'teacher-male-1',
    avatarName: '知识讲师大明',
    duration: 180,
    status: 'completed',
    createdAt: new Date('2024-01-14T15:20:00'),
    videoUrl: '#'
  },
  {
    id: '3',
    text: '尊敬的客户您好，感谢您选择我们的服务，有什么可以帮助您的吗？',
    avatarId: 'service-female-1',
    avatarName: '客服小雨',
    duration: 60,
    status: 'completed',
    createdAt: new Date('2024-01-13T09:15:00'),
    videoUrl: '#'
  }
];

export function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: DigitalHumanVideo['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, label: '等待中' },
      processing: { variant: 'default' as const, label: '处理中' },
      completed: { variant: 'success' as const, label: '已完成' },
      failed: { variant: 'destructive' as const, label: '失败' }
    };
    return variants[status];
  };

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">历史记录</h2>
          <p className="text-muted-foreground mt-1">共 {mockHistory.length} 个视频</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-1" />
            清空历史
          </Button>
        </div>
      </div>

      {/* 搜索和筛选栏 */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索视频内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="processing">处理中</SelectItem>
              <SelectItem value="failed">失败</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">最新优先</SelectItem>
              <SelectItem value="oldest">最早优先</SelectItem>
              <SelectItem value="longest">时长最长</SelectItem>
              <SelectItem value="shortest">时长最短</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* 历史记录列表 */}
      <div className="grid gap-4">
        {mockHistory.map((video) => {
          const statusBadge = getStatusBadge(video.status);
          
          return (
            <Card key={video.id} className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Video className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{video.text}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span>{video.avatarName}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {video.duration ? formatDuration(video.duration) : '--'}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {video.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={statusBadge.variant}>
                    {statusBadge.label}
                  </Badge>
                  
                  {video.status === 'completed' && (
                    <>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        播放
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        下载
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 空状态 */}
      {mockHistory.length === 0 && (
        <Card className="p-16">
          <div className="text-center">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无历史记录</h3>
            <p className="text-muted-foreground">您还没有生成过任何视频</p>
          </div>
        </Card>
      )}
    </div>
  );
}