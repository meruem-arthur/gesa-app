// ─────────────────────────────────────────────────────────────────────────────
// cloudinary.js — GESA UMaT
// Cloud name:    df9ns044o
// Upload preset: gesa-app  (unsigned)
// ─────────────────────────────────────────────────────────────────────────────

const CLOUD_NAME    = 'df9ns044o';
const UPLOAD_PRESET = 'gesa-app';

// ─── uploadFile — PDFs (learning materials & past questions) ──────────────────
export async function uploadFile(fileUri, folder = 'gesa') {
  const isPDF    = fileUri.toLowerCase().endsWith('.pdf') || fileUri.toLowerCase().includes('.pdf');
  const fileName = fileUri.split('/').pop();
  const mimeType = isPDF ? 'application/pdf' : 'image/jpeg';
  const resType  = isPDF ? 'raw' : 'image';

  const formData = new FormData();
  formData.append('file',           { uri: fileUri, type: mimeType, name: fileName });
  formData.append('upload_preset',  UPLOAD_PRESET);
  formData.append('folder',         folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resType}/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}

// ─── uploadPhoto — executive & lecturer profile photos ────────────────────────
export async function uploadPhoto(fileUri, folder = 'gesa/photos') {
  const fileName = fileUri.split('/').pop();

  const formData = new FormData();
  formData.append('file',          { uri: fileUri, type: 'image/jpeg', name: fileName });
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder',        folder);
  // NOTE: transformation is NOT allowed with unsigned presets — omitted intentionally

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Photo upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}
