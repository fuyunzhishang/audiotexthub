"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Announcement } from "@/models/announcement";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { translateAnnouncement } from "@/services/translation";
import { Loader2, Languages } from "lucide-react";

interface AnnouncementEditDialogProps {
  announcement: Announcement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AnnouncementEditDialog({
  announcement,
  open,
  onOpenChange,
  onSuccess,
}: AnnouncementEditDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    title_zh: "",
    content_zh: "",
    title_en: "",
    content_en: "",
    type: "info" as Announcement["type"],
    priority: 0,
    is_active: true,
    start_time: new Date().toISOString().slice(0, 16),
    end_time: "",
    default_language: "en",
  });
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState("en");

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        title_zh: announcement.title_zh || announcement.title || "",
        content_zh: announcement.content_zh || announcement.content || "",
        title_en: announcement.title_en || "",
        content_en: announcement.content_en || "",
        type: announcement.type,
        priority: announcement.priority,
        is_active: announcement.is_active,
        start_time: new Date(announcement.start_time).toISOString().slice(0, 16),
        end_time: announcement.end_time ? new Date(announcement.end_time).toISOString().slice(0, 16) : "",
        default_language: announcement.default_language || "en",
      });
    } else {
      setFormData({
        title: "",
        content: "",
        title_zh: "",
        content_zh: "",
        title_en: "",
        content_en: "",
        type: "info",
        priority: 0,
        is_active: true,
        start_time: new Date().toISOString().slice(0, 16),
        end_time: "",
        default_language: "en",
      });
    }
  }, [announcement]);

  const handleAutoTranslate = async () => {
    setTranslating(true);
    try {
      if (activeTab === "zh") {
        // Translate from Chinese to English
        const { title, content } = await translateAnnouncement(
          formData.title_zh,
          formData.content_zh,
          "zh",
          "en"
        );
        setFormData(prev => ({
          ...prev,
          title_en: title,
          content_en: content,
        }));
        toast.success("Auto-translated to English");
      } else {
        // Translate from English to Chinese
        const { title, content } = await translateAnnouncement(
          formData.title_en,
          formData.content_en,
          "en",
          "zh"
        );
        setFormData(prev => ({
          ...prev,
          title_zh: title,
          content_zh: content,
        }));
        toast.success("Auto-translated to Chinese");
      }
    } catch (error) {
      console.error("Translation failed:", error);
      toast.error("Translation failed");
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Set title and content based on default language
      const title = formData.default_language === "zh" ? formData.title_zh : formData.title_en;
      const content = formData.default_language === "zh" ? formData.content_zh : formData.content_en;

      const payload = {
        title,
        content,
        title_zh: formData.title_zh,
        content_zh: formData.content_zh,
        title_en: formData.title_en,
        content_en: formData.content_en,
        type: formData.type,
        priority: Number(formData.priority),
        is_active: formData.is_active,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
        default_language: formData.default_language,
      };

      const url = announcement
        ? `/api/admin/announcements/${announcement.uuid}`
        : "/api/admin/announcements";
      const method = announcement ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(announcement ? "Announcement updated" : "Announcement created");
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save announcement");
      }
    } catch (error) {
      console.error("Failed to save announcement:", error);
      toast.error("Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {announcement ? "Edit Announcement" : "Create Announcement"}
            </DialogTitle>
            <DialogDescription>
              {announcement
                ? "Update the announcement details below."
                : "Fill in the details to create a new announcement."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="zh">中文</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoTranslate}
                  disabled={translating}
                >
                  {translating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Languages className="h-4 w-4 mr-2" />
                  )}
                  Auto Translate
                </Button>
              </div>

              <TabsContent value="zh" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title_zh">标题</Label>
                  <Input
                    id="title_zh"
                    value={formData.title_zh}
                    onChange={(e) => setFormData({ ...formData, title_zh: e.target.value })}
                    placeholder="公告标题"
                    required={formData.default_language === "zh"}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content_zh">内容</Label>
                  <Textarea
                    id="content_zh"
                    value={formData.content_zh}
                    onChange={(e) => setFormData({ ...formData, content_zh: e.target.value })}
                    placeholder="公告内容"
                    rows={6}
                    required={formData.default_language === "zh"}
                  />
                </div>
              </TabsContent>

              <TabsContent value="en" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title_en">Title</Label>
                  <Input
                    id="title_en"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="Announcement title"
                    required={formData.default_language === "en"}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content_en">Content</Label>
                  <Textarea
                    id="content_en"
                    value={formData.content_en}
                    onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                    placeholder="Announcement content"
                    rows={6}
                    required={formData.default_language === "en"}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Announcement["type"]) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_time">End Time (Optional)</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : announcement ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}