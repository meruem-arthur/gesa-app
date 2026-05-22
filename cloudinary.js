// ─────────────────────────────────────────────────────────────────────────────
// cloudinary.js — GESA UMaT
// Cloud name:    df9ns044o
// Upload preset: gesa-app  (unsigned)
// ─────────────────────────────────────────────────────────────────────────────

const CLOUD_NAME    = 'df9ns044o';
const UPLOAD_PRESET = 'gesa-app';

// ─── uploadFile — PDFs (learning materials & past questions) ──────────────────
export async function uploadFile(fileUri, folder = 'gesa') {
  const fileName = fileUri.split('/').pop() || 'upload.pdf';

  const formData = new FormData();
  formData.append('file',          { uri: fileUri, type: 'application/pdf', name: fileName });
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder',        folder);
  formData.append('resource_type', 'image');
  formData.append('format',        'pdf');
  formData.append('access_mode',   'public');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
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