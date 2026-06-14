"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Upload,
  Star,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface Channel {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  streamUrl: string;
  enabled: boolean;
  featured: boolean;
  sortOrder: number;
  categoryId: string;
  category?: { name: string };
}

function SortableChannel({
  channel,
  onEdit,
  onDelete,
}: {
  channel: Channel;
  onEdit: (ch: Channel) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: channel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-xl glass p-4",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-500 hover:text-gray-300 active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/5">
        {channel.logoUrl ? (
          <Image src={channel.logoUrl} alt="" fill className="object-contain p-1" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-600">
            TV
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-white">{channel.title}</p>
          {channel.featured && <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />}
        </div>
        <p className="truncate text-xs text-gray-500">
          {channel.category?.name} · Stream URL hidden
        </p>
      </div>

      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-xs",
          channel.enabled
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
        )}
      >
        {channel.enabled ? "On" : "Off"}
      </span>

      <button
        onClick={() => onEdit(channel)}
        className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(channel.id)}
        className="rounded-lg p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

const emptyForm = {
  title: "",
  description: "",
  logoUrl: "",
  streamUrl: "",
  categoryId: "",
  enabled: true,
  featured: false,
};

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Channel | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchData = async () => {
    const [chRes, catRes] = await Promise.all([
      fetch("/api/admin/channels"),
      fetch("/api/admin/categories"),
    ]);
    if (chRes.ok) setChannels(await chRes.json());
    if (catRes.ok) {
      const cats = await catRes.json();
      setCategories(cats.map((c: Category) => ({ id: c.id, name: c.name })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = channels.findIndex((c) => c.id === active.id);
    const newIndex = channels.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(channels, oldIndex, newIndex).map((c, i) => ({
      ...c,
      sortOrder: i,
    }));

    setChannels(reordered);

    await fetch("/api/admin/channels/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: reordered.map((c) => ({ id: c.id, sortOrder: c.sortOrder })),
      }),
    });
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id || "",
    });
    setModalOpen(true);
  };

  const openEdit = (ch: Channel) => {
    setEditing(ch);
    setForm({
      title: ch.title,
      description: ch.description || "",
      logoUrl: ch.logoUrl || "",
      streamUrl: ch.streamUrl,
      categoryId: ch.categoryId,
      enabled: ch.enabled,
      featured: ch.featured,
    });
    setModalOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      setForm((f) => ({ ...f, logoUrl: url }));
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      description: form.description || undefined,
      logoUrl: form.logoUrl || null,
    };

    if (editing) {
      await fetch(`/api/admin/channels/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this channel?")) return;
    await fetch(`/api/admin/channels/${id}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Channels</h1>
        <button
          onClick={openCreate}
          disabled={categories.length === 0}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:from-purple-500 hover:to-blue-500 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Channel
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={channels.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {channels.map((ch) => (
              <SortableChannel
                key={ch.id}
                channel={ch}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
            {channels.length === 0 && (
              <p className="py-8 text-center text-gray-500">No channels yet</p>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg rounded-2xl glass-strong p-6 animate-slide-up">
            <h2 className="mb-4 text-lg font-semibold text-white">
              {editing ? "Edit Channel" : "New Channel"}
            </h2>
            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl glass px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl glass px-4 py-2.5 text-sm text-white outline-none resize-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full rounded-xl glass px-4 py-2.5 text-sm text-white outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-gray-900">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  m3u8 Stream URL
                </label>
                <input
                  value={form.streamUrl}
                  onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
                  className="w-full rounded-xl glass px-4 py-2.5 text-sm text-white outline-none"
                  placeholder="https://example.com/stream.m3u8"
                />
                <p className="mt-1 text-xs text-gray-600">
                  Stored securely in database, never exposed to frontend
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Logo</label>
                <div className="flex items-center gap-3">
                  {form.logoUrl && (
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white/5">
                      <Image src={form.logoUrl} alt="" fill className="object-contain p-1" />
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm text-gray-300 hover:text-white"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload Logo
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                    className="rounded"
                  />
                  Enabled
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="rounded"
                  />
                  Featured
                </label>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-xl glass py-2.5 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={
                  saving ||
                  !form.title.trim() ||
                  !form.streamUrl.trim() ||
                  !form.categoryId
                }
                className="flex-1 rounded-xl bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
