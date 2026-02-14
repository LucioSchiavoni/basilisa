const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_AUDIO_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/x-m4a",
  "audio/ogg",
  "audio/webm",
];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1 || lastDot === filename.length - 1) return "";
  return filename.slice(lastDot + 1).toLowerCase();
}

export function isValidImageType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType);
}

export function isValidAudioType(mimeType: string): boolean {
  return ALLOWED_AUDIO_TYPES.includes(mimeType);
}

export function validateImageFile(file: File): void {
  if (!isValidImageType(file.type)) {
    throw new Error("El archivo debe ser una imagen (JPG, PNG, WEBP o GIF)");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("La imagen no puede superar 2MB");
  }
}

export function validateAudioFile(file: File): void {
  if (!isValidAudioType(file.type)) {
    throw new Error(
      "El archivo debe ser audio (MP3, MP4, WAV, M4A, OGG o WEBM)"
    );
  }
  if (file.size > MAX_AUDIO_SIZE) {
    throw new Error("El audio no puede superar 10MB");
  }
}
