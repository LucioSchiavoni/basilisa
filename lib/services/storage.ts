"use client";

import { createClient } from "@/lib/supabase/client";
import imageCompression from "browser-image-compression";
import {
  validateImageFile,
  validateAudioFile,
  getFileExtension,
} from "@/lib/utils/file";

export async function uploadImage(
  file: File,
  path: string
): Promise<{ url: string; path: string }> {
  validateImageFile(file);

  const uniqueFileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.webp`;
  const fullPath = `${path}${uniqueFileName}`;

  const compressedFile = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 800,
    fileType: "image/webp",
    initialQuality: 0.8,
  });

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("exercise-images")
    .upload(fullPath, compressedFile, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Error al subir imagen: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("exercise-images").getPublicUrl(data.path);

  return { url: publicUrl, path: data.path };
}

export async function uploadAudio(
  file: File,
  path: string
): Promise<{ url: string; path: string }> {
  validateAudioFile(file);

  const ext = getFileExtension(file.name);
  const uniqueFileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const fullPath = `${path}${uniqueFileName}`;

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("exercise-audio")
    .upload(fullPath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Error al subir audio: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("exercise-audio").getPublicUrl(data.path);

  return { url: publicUrl, path: data.path };
}

export async function deleteFile(
  bucket: string,
  path: string
): Promise<void> {
  if (bucket !== "exercise-images" && bucket !== "exercise-audio") {
    throw new Error("Bucket inválido");
  }

  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Error al eliminar archivo: ${error.message}`);
  }
}
