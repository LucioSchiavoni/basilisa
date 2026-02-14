"use client";

import { useCallback, useRef, useState } from "react";
import { Mic, Upload, X, Loader2, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AudioRecorder } from "@/components/admin/audio-recorder";
import { uploadAudio, deleteFile } from "@/lib/services/storage";
import { validateAudioFile } from "@/lib/utils/file";
import { getAudioDuration, formatDuration } from "@/lib/utils/audio";

interface AudioUploadProps {
  value?: string;
  onChange: (url: string, path: string) => void;
  path: string;
  label?: string;
  maxSize?: string;
}

export function AudioUpload({
  value,
  onChange,
  path,
  label = "Audio",
}: AudioUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [mode, setMode] = useState<"idle" | "record" | "url">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);

      try {
        validateAudioFile(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Archivo invalido");
        return;
      }

      const fileDuration = await getAudioDuration(file);
      setDuration(fileDuration);

      setUploading(true);
      try {
        const result = await uploadAudio(file, path);
        setStoragePath(result.path);
        onChange(result.url, result.path);
        setMode("idle");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al subir el audio"
        );
        setDuration(null);
      } finally {
        setUploading(false);
      }
    },
    [path, onChange]
  );

  const handleDelete = useCallback(async () => {
    if (!storagePath) {
      onChange("", "");
      setDuration(null);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      await deleteFile("exercise-audio", storagePath);
      setStoragePath(null);
      setDuration(null);
      onChange("", "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar el audio"
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
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
      if (inputRef.current) inputRef.current.value = "";
    },
    [handleUpload]
  );

  const handleRecordingComplete = useCallback(
    (blob: Blob) => {
      const baseType = blob.type.split(";")[0];
      const ext = baseType.includes("mp4") ? "m4a" : "webm";
      const file = new File([blob], `grabacion.${ext}`, { type: baseType });
      handleUpload(file);
    },
    [handleUpload]
  );

  const handleExternalUrl = useCallback(
    (url: string) => {
      const trimmed = url.trim();
      if (!trimmed) {
        setError("Ingresa una URL valida");
        return;
      }
      try {
        new URL(trimmed);
      } catch {
        setError("La URL ingresada no es valida");
        return;
      }
      setError(null);
      setStoragePath(null);
      setDuration(null);
      onChange(trimmed, "");
      setMode("idle");
    },
    [onChange]
  );

  if (value) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <audio
            src={value}
            controls
            preload="metadata"
            className="h-8 min-w-0 flex-1 max-w-[calc(100%-5rem)]"
          />
          {duration !== null && formatDuration(duration) && (
            <span className="text-xs text-muted-foreground shrink-0">
              {formatDuration(duration)}
            </span>
          )}
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
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {mode === "idle" && (
        <div className="flex items-center gap-1.5">
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
            className={`flex flex-1 items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-input hover:bg-accent hover:text-accent-foreground"
            } ${uploading ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="size-4 text-muted-foreground" />
            )}
            <span className="text-muted-foreground">
              {uploading ? "Subiendo..." : label}
            </span>
          </button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 h-9 w-9"
            onClick={() => setMode("record")}
            title="Grabar audio"
          >
            <Mic className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 h-9 w-9"
            onClick={() => setMode("url")}
            title="URL externa"
          >
            <Link className="size-4" />
          </Button>
        </div>
      )}

      {mode === "record" && (
        <div className="space-y-2">
          {uploading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Subiendo grabacion...</span>
            </div>
          ) : (
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMode("idle")}
            className="text-xs"
          >
            Cancelar
          </Button>
        </div>
      )}

      {mode === "url" && (
        <div className="space-y-2">
          <UrlInput onSubmit={handleExternalUrl} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMode("idle")}
            className="text-xs"
          >
            Cancelar
          </Button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,audio/mp4,audio/wav,audio/x-m4a,audio/ogg,audio/webm"
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function UrlInput({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [url, setUrl] = useState("");
  return (
    <div className="flex gap-2">
      <Input
        type="url"
        placeholder="https://ejemplo.com/audio.mp3"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit(url);
          }
        }}
        className="h-9"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onSubmit(url)}
      >
        Usar
      </Button>
    </div>
  );
}
