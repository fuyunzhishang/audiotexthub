"use client";

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAnnouncements } from './AnnouncementProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Announcement } from '@/models/announcement';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export function AnnouncementIcon() {
  const { announcements, unreadAnnouncements, markAsRead } = useAnnouncements();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('announcement');

  const handleAnnouncementClick = (announcement: Announcement) => {
    // 点击未读公告时才标记为已读
    const isUnread = unreadAnnouncements.some(a => a.uuid === announcement.uuid);
    if (isUnread) {
      markAsRead(announcement.uuid);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadAnnouncements.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadAnnouncements.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{t('title')}</h3>
          {unreadAnnouncements.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {t('unread_count', { count: unreadAnnouncements.length })}
            </span>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {announcements.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {t('no_announcements')}
            </div>
          ) : (
            <div className="divide-y">
              {announcements.map((announcement) => {
                const isUnread = unreadAnnouncements.some(a => a.uuid === announcement.uuid);
                return (
                  <div
                    key={announcement.uuid}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                      isUnread && "bg-blue-50 dark:bg-blue-950/20"
                    )}
                    onClick={() => handleAnnouncementClick(announcement)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 shrink-0",
                        announcement.type === 'error' && "bg-red-500",
                        announcement.type === 'warning' && "bg-yellow-500",
                        announcement.type === 'success' && "bg-green-500",
                        announcement.type === 'info' && "bg-blue-500"
                      )} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium mb-1">
                          {announcement.title}
                          {isUnread && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {t('new')}
                            </Badge>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(announcement.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}