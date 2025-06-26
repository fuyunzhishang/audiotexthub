"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Announcement } from "@/models/announcement";
import { toast } from "sonner";
import AnnouncementEditDialog from "./edit-dialog";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/announcements");
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Toggle announcement active status
  const toggleActive = async (announcement: Announcement) => {
    try {
      const response = await fetch(`/api/admin/announcements/${announcement.uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !announcement.is_active }),
      });

      if (response.ok) {
        toast.success(announcement.is_active ? "Announcement deactivated" : "Announcement activated");
        fetchAnnouncements();
      } else {
        toast.error("Failed to update announcement");
      }
    } catch (error) {
      console.error("Failed to toggle announcement:", error);
      toast.error("Failed to update announcement");
    }
  };

  // Delete announcement
  const deleteAnnouncement = async (announcement: Announcement) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const response = await fetch(`/api/admin/announcements/${announcement.uuid}?hard=true`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Announcement deleted");
        fetchAnnouncements();
      } else {
        toast.error("Failed to delete announcement");
      }
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      toast.error("Failed to delete announcement");
    }
  };

  // Table columns
  const columns: ColumnDef<Announcement>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge variant={
            type === 'error' ? 'destructive' :
            type === 'warning' ? 'secondary' :
            type === 'success' ? 'default' :
            'outline'
          }>
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => row.original.priority,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "start_time",
      header: "Start Time",
      cell: ({ row }) => new Date(row.original.start_time).toLocaleString(),
    },
    {
      accessorKey: "end_time",
      header: "End Time",
      cell: ({ row }) => row.original.end_time ? new Date(row.original.end_time).toLocaleString() : "Never",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleActive(row.original)}
            title={row.original.is_active ? "Deactivate" : "Activate"}
          >
            {row.original.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedAnnouncement(row.original);
              setIsEditDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteAnnouncement(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Announcements</h1>
        <Button
          onClick={() => {
            setSelectedAnnouncement(null);
            setIsEditDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={announcements}
          loading={loading}
        />
      </Card>

      <AnnouncementEditDialog
        announcement={selectedAnnouncement}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => {
          setIsEditDialogOpen(false);
          fetchAnnouncements();
        }}
      />
    </div>
  );
}