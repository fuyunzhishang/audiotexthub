'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Plus, Edit2, Star, Lock } from 'lucide-react';
import { digitalHumanAvatars } from './avatars';
import type { DigitalHuman } from '@/types/digital-human';

export function AvatarsManagement() {
  const getLevelBadge = (level: DigitalHuman['level']) => {
    const variants = {
      free: { variant: 'secondary' as const, label: '免费', icon: null },
      premium: { variant: 'default' as const, label: '高级', icon: <Star className="h-3 w-3" /> },
      professional: { variant: 'destructive' as const, label: '专业', icon: <Lock className="h-3 w-3" /> }
    };
    return variants[level];
  };

  const getStyleLabel = (style: DigitalHuman['style']) => {
    const labels = {
      professional: '专业',
      education: '教育',
      service: '客服',
      sales: '销售',
      entertainment: '娱乐'
    };
    return labels[style];
  };

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">数字人管理</h2>
          <p className="text-muted-foreground mt-1">管理和自定义您的数字人形象</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          创建数字人
        </Button>
      </div>

      {/* 数字人网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {digitalHumanAvatars.map((avatar) => {
          const levelBadge = getLevelBadge(avatar.level);
          
          return (
            <Card key={avatar.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage src={avatar.preview} alt={avatar.name} className="object-cover" />
                  <AvatarFallback className="rounded-none">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <Badge 
                  variant={levelBadge.variant} 
                  className="absolute top-2 right-2 flex items-center gap-1"
                >
                  {levelBadge.icon}
                  {levelBadge.label}
                </Badge>
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold">{avatar.name}</h3>
                  <p className="text-sm text-muted-foreground">{getStyleLabel(avatar.style)}</p>
                </div>
                
                {avatar.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {avatar.description}
                  </p>
                )}
                
                {avatar.tags && avatar.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {avatar.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    预览
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit2 className="h-3 w-3 mr-1" />
                    编辑
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
        
        {/* 添加新数字人卡片 */}
        <Card className="border-dashed hover:border-primary transition-colors cursor-pointer">
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold">创建新数字人</h3>
            <p className="text-sm text-muted-foreground mt-1">
              自定义您的专属数字人形象
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}