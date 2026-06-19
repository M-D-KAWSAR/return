"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ added: number; skipped: number; addedList: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/import", { method: "POST", body: formData });
      const data = await res.json();
      if (data.ok) setResult(data);
      else setError(data.error || "Import failed");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Import Channels</h1>
        <p className="mt-1 text-sm text-gray-400">
          M3U/M3U8 playlist file upload করুন। <code className="text-purple-400">group-title</code> থেকে auto category তৈরি হবে। Duplicate URL skip হবে।
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl glass-strong p-6 space-y-4">
        <div
          className="cursor-pointer border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <FileText className="mx-auto h-10 w-10 text-gray-500 mb-3" />
          <p className="text-sm text-gray-400">
            {file ? (
              <span className="text-purple-400 font-medium">{file.name}</span>
            ) : (
              <>Click to select or drag an <span className="text-white">.m3u / .m3u8</span> file</>
            )}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".m3u,.m3u8,.txt"
            className="hidden"
            onChange={(e) => { setFile(e.target.files?.[0] || null); setResult(null); setError(null); }}
          />
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="h-4 w-4" />
          {loading ? "Importing..." : "Import Channels"}
        </button>
      </form>

      {result && (
        <div className="rounded-2xl glass-strong p-6 space-y-3">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Import সম্পন্ন!</span>
          </div>
          <div className="flex gap-6 text-sm">
            <span className="text-gray-300">Added: <strong className="text-green-400">{result.added}</strong></span>
            <span className="text-gray-300">Skipped (duplicate): <strong className="text-yellow-400">{result.skipped}</strong></span>
          </div>
          {result.addedList.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-xl bg-black/30 p-3 space-y-1">
              {result.addedList.map((name, i) => (
                <p key={i} className="text-xs text-gray-400">✓ {name}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
