'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, User } from 'lucide-react';
import type { DigitalHuman } from '@/types/digital-human';

interface DigitalHumanSelectorProps {
  digitalHumans: DigitalHuman[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function DigitalHumanSelector({
  digitalHumans,
  selectedId,
  onSelect,
  className
}: DigitalHumanSelectorProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'male' | 'female'>('all');

  const filteredHumans = digitalHumans.filter(human => {
    if (activeTab === 'all') return true;
    return human.gender === activeTab;
  });

  const getLevelBadge = (level: DigitalHuman['level']) => {
    const variants = {
      free: { variant: 'secondary' as const, label: '免费' },
      premium: { variant: 'default' as const, label: '高级' },
      professional: { variant: 'destructive' as const, label: '专业' }
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
    <div className={cn("w-full", className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            全部 ({digitalHumans.length})
          </TabsTrigger>
          <TabsTrigger value="male">
            男性 ({digitalHumans.filter(h => h.gender === 'male').length})
          </TabsTrigger>
          <TabsTrigger value="female">
            女性 ({digitalHumans.filter(h => h.gender === 'female').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          {filteredHumans.map((human) => {
            const isSelected = selectedId === human.id;
            const levelBadge = getLevelBadge(human.level);
            
            return (
              <div
                key={human.id}
                className={cn(
                  "relative flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                  "hover:shadow-sm hover:border-primary/50",
                  isSelected && "border-primary bg-primary/5 shadow-sm"
                )}
                onClick={() => onSelect(human.id)}
              >
                {/* 头像 */}
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={human.preview} alt={human.name} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{human.name}</span>
                    <Badge variant={levelBadge.variant} className="text-xs">
                      {levelBadge.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {getStyleLabel(human.style)}
                    </span>
                    {human.tags && human.tags.length > 0 && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground">
                          {human.tags.slice(0, 2).join('、')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* 选中标记 */}
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}