"use client";

import Image from "next/image";
import { Pencil, Trash2, Plus, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Ad {
  id: string;
  title: string;
  type: string;
  imageUrl: string | null;
  linkUrl: string | null;
  htmlCode: string | null;
  position: string;
  enabled: boolean;
  sortOrder: number;
}

const POSITIONS = [
  { value: "banner_top", label: "Top Banner (below header)" },
  { value: "banner_between", label: "Between Sections" },
  { value: "banner_bottom", label: "Bottom Banner (above footer)" },
];

const emptyForm = {
  title: "",
  type: "image",
  imageUrl: "",
  linkUrl: "",
  htmlCode: "",
  position: "banner_top",
  enabled: true,
};

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Ad | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAds = async () => {
    const res = await fetch("/api/admin/ads");
    if (res.ok) setAds(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchAds(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (ad: Ad) => {
    setEditing(ad);
    setForm({
      title: ad.title,
      type: ad.type,
      imageUrl: ad.imageUrl ?? "",
      linkUrl: ad.linkUrl ?? "",
      htmlCode: ad.htmlCode ?? "",
      position: ad.position,
      enabled: ad.enabled,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      imageUrl: form.imageUrl || null,
      linkUrl: form.linkUrl || null,
      htmlCode: form.htmlCode || null,
    };

    if (editing) {
      await fetch(`/api/admin/ads/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    setModalOpen(false);
    fetchAds();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ad?")) return;
    await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
    fetchAds();
  };

  const toggleEnabled = async (ad: Ad) => {
    await fetch(`/api/admin/ads/${ad.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...ad, enabled: !ad.enabled }),
    });
    fetchAds();
  };

  const positionLabel = (pos: string) =>
    POSITIONS.find((p) => p.value === pos)?.label ?? pos;

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
        <h1 className="text-2xl font-bold text-white">Ads</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:from-purple-500 hover:to-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Ad
        </button>
      </div>

      <div className="space-y-2">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="flex items-center gap-3 rounded-xl glass p-4"
          >
            {ad.type === "image" && ad.imageUrl ? (
              <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-white/5">
                <Image src={ad.imageUrl} alt="" fill className="object-contain p-1" />
              </div>
            ) : (
              <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs text-gray-500">
                HTML
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">{ad.title}</p>
              <p className="truncate text-xs text-gray-500">{positionLabel(ad.position)}</p>
            </div>

            <button
              onClick={() => toggleEnabled(ad)}
              className={cn(
                "shrink-0 transition-colors",
                ad.enabled ? "text-green-400" : "text-gray-600"
              )}
              aria-label={ad.enabled ? "Disable" : "Enable"}
            >
              {ad.enabled ? (
                <ToggleRight className="h-7 w-7" />
              ) : (
                <ToggleLeft className="h-7 w-7" />
              )}
            </button>

            <button
              onClick={() => openEdit(ad)}
              className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(ad.id)}
              className="rounded-lg p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {ads.length === 0 && (
          <p className="py-8 text-center text-gray-500">No ads yet</p>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg rounded-2xl glass-strong p-6 animate-slide-up">
            <h2 className="mb-4 text-lg font-semibold text-white">
              {editing ? "Edit Ad" : "New Ad"}
            </h2>

            <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl glass px-4 py-2.5 text-sm text-white outline-none"
                  placeholder="Banner Ad 1"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-xl glass px-4 py-2.5 text-sm text-white outline-none"
                >
                  <option value="image" className="bg-gray-900">Image Banner</option>
                  <option value="html" className="bg-gray-900">HTML / Script (AdSense)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Position</label>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full rounded-xl glass px-4 py-2.5 text-sm text-white outline-none"
                >
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value} className="bg-gray-900">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {form.type === "image" ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm text-gray-400">Image URL</label>
                    <input
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      className="w-full rounded-xl glass px-4 py-2.5 text-sm text-white outline-none"
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-400">Link URL</label>
                    <input
                      value={form.linkUrl}
                      onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                      className="w-full rounded-xl glass px-4 py-2.5 text-sm text-white outline-none"
                      placeholder="https://example.com"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    HTML / Script Code
                  </label>
                  <textarea
                    value={form.htmlCode}
                    onChange={(e) => setForm({ ...form, htmlCode: e.target.value })}
                    rows={6}
                    className="w-full rounded-xl glass px-4 py-2.5 text-sm text-white outline-none resize-none font-mono"
                    placeholder={'<script async src="https://pagead2.googlesyndication.com/..."></script>\n<ins class="adsbygoogle" ...></ins>'}
                  />
                  <p className="mt-1 text-xs text-gray-600">
                    Google AdSense, custom banner scripts, or any HTML
                  </p>
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                  className="rounded"
                />
                Enabled
              </label>
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
                disabled={saving || !form.title.trim()}
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
