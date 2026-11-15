"use client";

import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  /** The newly chosen file, if any. */
  file: File | null;
  onChange: (file: File | null) => void;
  /** An image that is already saved, shown until a new one is chosen. */
  currentUrl?: string;
  label: string;
  hint?: string;
  shape?: "wide" | "square";
  error?: string;
}

const MAX_SOURCE_BYTES = 12 * 1024 * 1024;

/**
 * Picks an image by click or drag and drop. Large photos are shrunk in the
 * browser first so uploads stay quick on a slow connection.
 */
export function ImageDrop({ file, onChange, currentUrl, label, hint, shape = "wide", error }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const accept = async (picked: File | undefined) => {
    if (!picked) return;
    setProblem(null);
    if (!picked.type.startsWith("image/")) {
      setProblem("Choose an image file (JPG, PNG or WebP).");
      return;
    }
    if (picked.size > MAX_SOURCE_BYTES) {
      setProblem("That image is larger than 12 MB. Choose a smaller one.");
      return;
    }
    setBusy(true);
    try {
      const compressed = await imageCompression(picked, {
        maxSizeMB: shape === "square" ? 0.25 : 0.8,
        maxWidthOrHeight: shape === "square" ? 640 : 1920,
        useWebWorker: true,
      });
      onChange(new File([compressed], picked.name, { type: compressed.type || picked.type }));
    } catch {
      // Compression is an optimisation; the original is still a valid upload.
      onChange(picked);
    } finally {
      setBusy(false);
    }
  };

  const shown = preview ?? currentUrl ?? null;
  const message = error ?? problem;

  return (
    <div className={shape === "square" ? "w-36" : "w-full"}>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        aria-label={shown ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
        className={cn(
          "group relative flex w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-gray-50 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
          shape === "square" ? "aspect-square" : "aspect-[16/7]",
          dragging ? "border-teal bg-teal/5" : message ? "border-rose-300" : "border-gray-200 hover:border-teal/50",
        )}
      >
        {shown ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shown} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              Replace
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-2 px-3 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm ring-1 ring-gray-200">
              <ImagePlus className="h-5 w-5" />
            </span>
            <span className="text-[13px] font-semibold text-gray-700">{label}</span>
            {shape === "wide" && <span className="text-xs text-gray-500">Click to choose or drop an image here</span>}
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Loader2 className="h-5 w-5 animate-spin text-teal" />
          </span>
        )}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {message ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
          {message}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}
