"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage, deleteFile } from "@/lib/services/storage";
import { validateImageFile } from "@/lib/utils/file";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string, path: string) => void;
  path: string;
  label?: string;
  maxSize?: string;
}

export function ImageUpload({
  value,
  onChange,
  path,
  label = "Imagen",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      try {
        validateImageFile(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Archivo invalido");
        return;
      }

      setUploading(true);
      try {
        const result = await uploadImage(file, path);
        setStoragePath(result.path);
        onChange(result.url, result.path);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al subir la imagen"
        );
      } finally {
        setUploading(false);
      }
    },
    [path, onChange]
  );

  const handleDelete = useCallback(async () => {
    if (!storagePath) {
      onChange("", "");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      await deleteFile("exercise-images", storagePath);
      setStoragePath(null);
      onChange("", "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar la imagen"
      );
    } finally {
      setUploading(false);
    }
  }, [storagePath, onChange]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      if (inputRef.current) inputRef.current.value = "";
    },
    [handleFile]
  );

  return (
    <div className="space-y-1.5">
      {value ? (
        <div className="flex items-center gap-2">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border">
            <Image
              src={value}
              alt={label}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-sm text-muted-foreground truncate flex-1">
            {label}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <X className="size-3.5" />
            )}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOver(false);
          }}
          disabled={uploading}
          className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-input hover:bg-accent hover:text-accent-foreground"
          } ${uploading ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <ImagePlus className="size-4 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">
            {uploading ? "Subiendo..." : label}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
