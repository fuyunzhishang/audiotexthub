'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Home, 
  Video, 
  Image, 
  Settings, 
  History, 
  FileText,
  Mic,
  Palette,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface DigitalHumanSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const getSidebarItems = (t: any): SidebarItem[] => [
  {
    id: 'workspace',
    label: t('digital_human.sidebar.workspace'),
    icon: <Home className="h-4 w-4" />
  },
  {
    id: 'avatars',
    label: t('digital_human.sidebar.avatars'),
    icon: <Video className="h-4 w-4" />
  },
  {
    id: 'voice',
    label: t('digital_human.sidebar.voice'),
    icon: <Mic className="h-4 w-4" />
  },
  {
    id: 'templates',
    label: t('digital_human.sidebar.templates'),
    icon: <FileText className="h-4 w-4" />,
    badge: t('digital_human.sidebar.new')
  },
  {
    id: 'background',
    label: t('digital_human.sidebar.background'),
    icon: <Palette className="h-4 w-4" />
  },
  {
    id: 'history',
    label: t('digital_human.sidebar.history'),
    icon: <History className="h-4 w-4" />
  },
  {
    id: 'settings',
    label: t('digital_human.sidebar.settings'),
    icon: <Settings className="h-4 w-4" />
  }
];

export function DigitalHumanSidebar({ 
  activeTab, 
  onTabChange,
  className 
}: DigitalHumanSidebarProps) {
  const t = useTranslations();
  const [collapsed, setCollapsed] = useState(false);
  const sidebarItems = getSidebarItems(t);

  return (
    <div 
      className={cn(
        "relative flex flex-col h-full bg-muted/30 border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Logo区域 */}
      <div className="p-4 border-b">
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">{t('digital_human.sidebar.digital_human_workspace')}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 菜单项 */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start relative",
                collapsed && "justify-center"
              )}
              onClick={() => onTabChange(item.id)}
            >
              {item.icon}
              {!collapsed && (
                <>
                  <span className="ml-2">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* 底部信息 */}
      {!collapsed && (
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground">
            <div>{t('digital_human.sidebar.usage')}: 120/500</div>
            <div className="mt-1">{t('digital_human.sidebar.remaining_credits')}: 380</div>
          </div>
        </div>
      )}
    </div>
  );
}